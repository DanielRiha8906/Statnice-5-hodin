"""Repozitářová vrstva.

Repozitář je mezivrstva mezi čistou aplikační logikou a databází. Umí:

- uložit experiment,
- uložit model a jeho parametry,
- propojit model s experimentem a výsledkem,
- vracet data pro výpisy a filtrování.

Díky tomu zůstává GUI i servisní vrstva čitelnější a nejsou zaplavené SQL kódem.
"""

from __future__ import annotations

import sqlite3

from ml_experiments.database import DatabaseManager
from ml_experiments.models import (
    Experiment,
    ExperimentResult,
    MLModel,
    ModelParameter,
    ResultView,
)


class ExperimentRepository:
    """Repozitář pro ukládání a čtení dat o experimentech a modelech."""

    def __init__(self, database_manager: DatabaseManager) -> None:
        """Uloží správce databáze pro pozdější vytváření spojení."""

        self.database_manager = database_manager

    def create_experiment(self, experiment: Experiment) -> Experiment:
        """Uloží nový experiment do tabulky `experiments`."""

        with self.database_manager.get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO experiments (name, description)
                VALUES (?, ?)
                """,
                (experiment.name, experiment.description),
            )
            experiment.id = int(cursor.lastrowid)
        return experiment

    def list_experiments(self) -> list[Experiment]:
        """Vrátí všechny experimenty seřazené podle názvu."""

        with self.database_manager.get_connection() as connection:
            rows = connection.execute(
                """
                SELECT id, name, description
                FROM experiments
                ORDER BY name COLLATE NOCASE
                """
            ).fetchall()

        return [
            Experiment(id=row["id"], name=row["name"], description=row["description"])
            for row in rows
        ]

    def create_model(self, model: MLModel) -> MLModel:
        """Uloží nový model a následně i jeho parametry.

        Operaci děláme v jedné transakci. Pokud by se nepovedlo uložit některý
        parametr, nechceme v databázi ponechat „poloviční“ model bez konfigurace.
        """

        with self.database_manager.get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO models (model_type, name, description)
                VALUES (?, ?, ?)
                """,
                (model.model_type, model.name, model.description),
            )
            model.id = int(cursor.lastrowid)

            connection.executemany(
                """
                INSERT INTO model_parameters (model_id, parameter_name, parameter_value)
                VALUES (?, ?, ?)
                """,
                [
                    (model.id, parameter.name, parameter.value)
                    for parameter in model.parameters
                ],
            )
        return model

    def list_models(self, model_type: str | None = None) -> list[MLModel]:
        """Vrátí seznam modelů, volitelně omezený na konkrétní typ."""

        query = """
            SELECT id, model_type, name, description
            FROM models
        """
        parameters: tuple[str, ...] = ()

        if model_type:
            query += " WHERE model_type = ?"
            parameters = (model_type,)

        query += " ORDER BY name COLLATE NOCASE"

        with self.database_manager.get_connection() as connection:
            rows = connection.execute(query, parameters).fetchall()

        models: list[MLModel] = []
        for row in rows:
            models.append(
                MLModel(
                    id=row["id"],
                    model_type=row["model_type"],
                    name=row["name"],
                    description=row["description"],
                    parameters=self.get_parameters_for_model(row["id"]),
                )
            )

        return models

    def get_parameters_for_model(self, model_id: int) -> list[ModelParameter]:
        """Vrátí parametry jednoho modelu jako seznam datových tříd."""

        with self.database_manager.get_connection() as connection:
            rows = connection.execute(
                """
                SELECT parameter_name, parameter_value
                FROM model_parameters
                WHERE model_id = ?
                ORDER BY id
                """,
                (model_id,),
            ).fetchall()

        return [
            ModelParameter(name=row["parameter_name"], value=row["parameter_value"])
            for row in rows
        ]

    def assign_model_to_experiment(self, result: ExperimentResult) -> ExperimentResult:
        """Uloží vazbu modelu do experimentu spolu s výsledným skóre."""

        with self.database_manager.get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO experiment_results (experiment_id, model_id, result_value)
                VALUES (?, ?, ?)
                """,
                (result.experiment_id, result.model_id, result.result_value),
            )
            result.id = int(cursor.lastrowid)
        return result

    def list_results_for_experiment(
        self,
        experiment_id: int,
        model_type: str | None = None,
        sort_descending: bool = True,
    ) -> list[ResultView]:
        """Vrátí výsledky vybraného experimentu včetně dat o modelu.

        Metoda demonstruje typický SQL dotaz přes více tabulek:
        `experiment_results` spojuje experimenty a modely, přičemž detaily modelu
        bereme z tabulky `models` a konfiguraci dopočítáme z `model_parameters`.
        """

        query = """
            SELECT
                er.id AS assignment_id,
                e.id AS experiment_id,
                e.name AS experiment_name,
                m.id AS model_id,
                m.name AS model_name,
                m.model_type AS model_type,
                m.description AS model_description,
                er.result_value AS result_value
            FROM experiment_results er
            JOIN experiments e ON e.id = er.experiment_id
            JOIN models m ON m.id = er.model_id
            WHERE e.id = ?
        """
        parameters: list[object] = [experiment_id]

        if model_type and model_type != "Vše":
            query += " AND m.model_type = ?"
            parameters.append(model_type)

        sort_direction = "DESC" if sort_descending else "ASC"
        query += f" ORDER BY er.result_value {sort_direction}, m.name COLLATE NOCASE"

        with self.database_manager.get_connection() as connection:
            rows = connection.execute(query, tuple(parameters)).fetchall()

        results: list[ResultView] = []
        for row in rows:
            parameters_text = self._build_parameter_summary(row["model_id"])
            results.append(
                ResultView(
                    assignment_id=row["assignment_id"],
                    experiment_id=row["experiment_id"],
                    experiment_name=row["experiment_name"],
                    model_id=row["model_id"],
                    model_name=row["model_name"],
                    model_type=row["model_type"],
                    model_description=row["model_description"],
                    result_value=row["result_value"],
                    parameters_text=parameters_text,
                )
            )

        return results

    def _build_parameter_summary(self, model_id: int) -> str:
        """Poskládá parametry modelu do jednoho řetězce pro GUI tabulku."""

        with self.database_manager.get_connection() as connection:
            rows = connection.execute(
                """
                SELECT parameter_name, parameter_value
                FROM model_parameters
                WHERE model_id = ?
                ORDER BY id
                """,
                (model_id,),
            ).fetchall()

        return ", ".join(
            f"{row['parameter_name']}={row['parameter_value']}" for row in rows
        )

    def list_available_model_types(self) -> list[str]:
        """Vrátí modelové typy, které se aktuálně v databázi vyskytují."""

        with self.database_manager.get_connection() as connection:
            rows = connection.execute(
                """
                SELECT DISTINCT model_type
                FROM models
                ORDER BY model_type
                """
            ).fetchall()

        return [row["model_type"] for row in rows]

    @staticmethod
    def normalize_database_error(error: sqlite3.IntegrityError) -> str:
        """Převede technickou databázovou chybu na srozumitelnější text."""

        message = str(error)
        if "experiments.name" in message:
            return "Experiment se stejným názvem už existuje."
        if "models.name" in message:
            return "Model se stejným názvem už existuje."
        if "experiment_results.experiment_id, experiment_results.model_id" in message:
            return "Tento model už je do vybraného experimentu přiřazený."
        return f"Databázová chyba: {message}"
