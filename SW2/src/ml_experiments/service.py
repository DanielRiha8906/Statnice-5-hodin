"""Aplikační servis.

Servisní vrstva drží pravidla aplikace:

- validaci vstupů z GUI,
- převod textových hodnot na správné typy,
- a orchestrace mezi rozhraním a repozitářem.

Je to dobrá ukázka, proč nepsat vše přímo do tlačítek v GUI. Když logiku oddělíme,
je přehlednější, testovatelnější a lépe vysvětlitelná u zkoušky.
"""

from __future__ import annotations

import sqlite3

from ml_experiments.models import Experiment, ExperimentResult, MLModel, ModelParameter
from ml_experiments.repository import ExperimentRepository


class ValidationError(ValueError):
    """Výjimka pro chybné vstupy od uživatele."""


class ExperimentService:
    """Vyšší aplikační vrstva nad repozitářem."""

    SUPPORTED_MODELS: dict[str, list[tuple[str, str]]] = {
        "RandomForestClassifier": [
            ("n_estimators", "Počet stromů v lese"),
            ("max_depth", "Maximální hloubka stromu"),
            ("random_state", "Seed pro reprodukovatelnost"),
        ],
        "SVC": [
            ("C", "Regularizační parametr"),
            ("kernel", "Použitá jádrová funkce"),
            ("gamma", "Koeficient jádra"),
        ],
    }

    def __init__(self, repository: ExperimentRepository) -> None:
        """Uloží repozitář, přes který servis pracuje s databází."""

        self.repository = repository

    def create_experiment(self, name: str, description: str) -> Experiment:
        """Zvaliduje vstup a založí nový experiment."""

        cleaned_name = name.strip()
        cleaned_description = description.strip()

        if not cleaned_name:
            raise ValidationError("Název experimentu nesmí být prázdný.")
        if not cleaned_description:
            raise ValidationError("Popis experimentu nesmí být prázdný.")

        experiment = Experiment(name=cleaned_name, description=cleaned_description)

        try:
            return self.repository.create_experiment(experiment)
        except sqlite3.IntegrityError as error:
            raise ValidationError(
                self.repository.normalize_database_error(error)
            ) from error

    def create_model(
        self,
        model_type: str,
        name: str,
        description: str,
        parameter_values: dict[str, str],
    ) -> MLModel:
        """Vytvoří nový model a zvaliduje jeho konfiguraci."""

        cleaned_type = model_type.strip()
        cleaned_name = name.strip()
        cleaned_description = description.strip()

        if cleaned_type not in self.SUPPORTED_MODELS:
            raise ValidationError("Nepodporovaný typ modelu.")
        if not cleaned_name:
            raise ValidationError("Název modelu nesmí být prázdný.")
        if not cleaned_description:
            raise ValidationError("Popis modelu nesmí být prázdný.")

        parameters = self._validate_and_build_parameters(
            cleaned_type, parameter_values
        )
        model = MLModel(
            model_type=cleaned_type,
            name=cleaned_name,
            description=cleaned_description,
            parameters=parameters,
        )

        try:
            return self.repository.create_model(model)
        except sqlite3.IntegrityError as error:
            raise ValidationError(
                self.repository.normalize_database_error(error)
            ) from error

    def _validate_and_build_parameters(
        self,
        model_type: str,
        parameter_values: dict[str, str],
    ) -> list[ModelParameter]:
        """Ověří parametry modelu a vrátí je jako datové třídy.

        Validace je záměrně jednoduchá, ale ukazuje dobrou praxi:
        různé algoritmy mají různá očekávání nad doménou vstupů.
        """

        parameters: list[ModelParameter] = []

        for parameter_name, _ in self.SUPPORTED_MODELS[model_type]:
            raw_value = parameter_values.get(parameter_name, "").strip()
            if not raw_value:
                raise ValidationError(
                    f"Parametr '{parameter_name}' musí být vyplněný."
                )

            if model_type == "RandomForestClassifier":
                self._validate_random_forest_parameter(parameter_name, raw_value)
            elif model_type == "SVC":
                self._validate_svc_parameter(parameter_name, raw_value)

            parameters.append(ModelParameter(name=parameter_name, value=raw_value))

        return parameters

    def _validate_random_forest_parameter(
        self, parameter_name: str, parameter_value: str
    ) -> None:
        """Validace vybraných parametrů pro Random Forest."""

        if parameter_name in {"n_estimators", "max_depth", "random_state"}:
            try:
                numeric_value = int(parameter_value)
            except ValueError as error:
                raise ValidationError(
                    f"Parametr '{parameter_name}' musí být celé číslo."
                ) from error

            if parameter_name != "random_state" and numeric_value <= 0:
                raise ValidationError(
                    f"Parametr '{parameter_name}' musí být kladné číslo."
                )

    def _validate_svc_parameter(
        self, parameter_name: str, parameter_value: str
    ) -> None:
        """Validace vybraných parametrů pro SVC."""

        if parameter_name == "C":
            try:
                numeric_value = float(parameter_value)
            except ValueError as error:
                raise ValidationError("Parametr 'C' musí být číslo.") from error

            if numeric_value <= 0:
                raise ValidationError("Parametr 'C' musí být kladné číslo.")

        if parameter_name == "kernel":
            allowed_kernels = {"linear", "poly", "rbf", "sigmoid"}
            if parameter_value not in allowed_kernels:
                kernels_text = ", ".join(sorted(allowed_kernels))
                raise ValidationError(
                    f"Parametr 'kernel' musí být jedna z hodnot: {kernels_text}."
                )

        if parameter_name == "gamma":
            if parameter_value not in {"scale", "auto"}:
                try:
                    numeric_value = float(parameter_value)
                except ValueError as error:
                    raise ValidationError(
                        "Parametr 'gamma' musí být 'scale', 'auto' nebo číslo."
                    ) from error
                if numeric_value <= 0:
                    raise ValidationError(
                        "Parametr 'gamma' musí být kladné číslo."
                    )

    def assign_model_to_experiment(
        self, experiment_id: int | None, model_id: int | None, result_value_text: str
    ) -> ExperimentResult:
        """Přiřadí model do experimentu a uloží dosažený výsledek."""

        if experiment_id is None:
            raise ValidationError("Nejprve vyber experiment.")
        if model_id is None:
            raise ValidationError("Nejprve vyber model.")

        try:
            result_value = float(result_value_text)
        except ValueError as error:
            raise ValidationError("Výsledek musí být číslo.") from error

        result = ExperimentResult(
            experiment_id=experiment_id,
            model_id=model_id,
            result_value=result_value,
        )

        try:
            return self.repository.assign_model_to_experiment(result)
        except sqlite3.IntegrityError as error:
            raise ValidationError(
                self.repository.normalize_database_error(error)
            ) from error

    def list_experiments(self) -> list[Experiment]:
        """Vrátí všechny experimenty."""

        return self.repository.list_experiments()

    def list_models(self, model_type: str | None = None) -> list[MLModel]:
        """Vrátí všechny modely, případně pouze daného typu."""

        return self.repository.list_models(model_type=model_type)

    def list_results_for_experiment(
        self,
        experiment_id: int | None,
        model_type: str | None = None,
        sort_descending: bool = True,
    ) -> list:
        """Vrátí výsledky pro vybraný experiment.

        Pokud není experiment vybraný, vracíme prázdný seznam. Je to praktičtější
        pro GUI než vyhazovat chybu při každém překreslení tabulky.
        """

        if experiment_id is None:
            return []

        return self.repository.list_results_for_experiment(
            experiment_id=experiment_id,
            model_type=model_type,
            sort_descending=sort_descending,
        )

    def list_available_model_types(self) -> list[str]:
        """Vrátí typy modelů pro filtrovací combobox."""

        return self.repository.list_available_model_types()

