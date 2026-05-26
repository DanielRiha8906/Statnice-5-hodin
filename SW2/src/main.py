"""Spouštěcí skript aplikace.

Soubor je záměrně malý. Většina logiky je v ostatních modulech, takže `main.py`
jen propojí jednotlivé vrstvy a spustí GUI.
"""

from __future__ import annotations

from pathlib import Path

from ml_experiments.app import MLExperimentApp
from ml_experiments.database import DatabaseManager
from ml_experiments.repository import ExperimentRepository
from ml_experiments.service import ExperimentService


def main() -> None:
    """Vytvoří všechny vrstvy aplikace a spustí hlavní okno."""

    project_root = Path(__file__).resolve().parent.parent
    database_path = project_root / "data" / "ml_experiments.db"

    database_manager = DatabaseManager(database_path=database_path)
    repository = ExperimentRepository(database_manager=database_manager)
    service = ExperimentService(repository=repository)

    application = MLExperimentApp(service=service)
    application.mainloop()


if __name__ == "__main__":
    main()

