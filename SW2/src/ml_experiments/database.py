"""Databázová vrstva aplikace.

Používáme SQLite, protože jde o relační databázi, která je součástí Pythonu.
Na zkoušku je to velmi praktická volba:

- není potřeba nic instalovat navíc,
- aplikace je snadno spustitelná,
- stále pracujeme s relačním modelem, tabulkami, vazbami i SQL.

Pokud by bylo potřeba přejít například na MySQL, většina architektury může
zůstat stejná a změnila by se hlavně implementace připojení a SQL dialekt.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path


class DatabaseManager:
    """Zajišťuje vytvoření databáze a poskytuje připojení.

    Třída slouží jako velmi malá infrastruktura. Ostatní vrstvy díky ní nemusí
    vědět, kde přesně leží soubor databáze ani jaké SQL je potřeba při
    inicializaci schématu.
    """

    def __init__(self, database_path: Path) -> None:
        """Uloží cestu k databázi a ihned vytvoří schéma, pokud ještě neexistuje."""

        self.database_path = database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self.initialize_database()

    def get_connection(self) -> sqlite3.Connection:
        """Vrátí nové SQLite spojení se slovníkovým přístupem ke sloupcům.

        `row_factory` nastavujeme na `sqlite3.Row`, protože pak můžeme ze
        získaného řádku číst hodnoty nejen přes indexy, ale i přes názvy sloupců.
        To bývá přehlednější a méně chybové.
        """

        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row

        # Cizí klíče nejsou ve SQLite automaticky vynucené, proto je explicitně
        # zapínáme při každém otevření spojení.
        connection.execute("PRAGMA foreign_keys = ON;")
        return connection

    def initialize_database(self) -> None:
        """Vytvoří tabulky aplikace, pokud ještě neexistují."""

        schema = """
        CREATE TABLE IF NOT EXISTS experiments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_type TEXT NOT NULL,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS model_parameters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER NOT NULL,
            parameter_name TEXT NOT NULL,
            parameter_value TEXT NOT NULL,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS experiment_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            experiment_id INTEGER NOT NULL,
            model_id INTEGER NOT NULL,
            result_value REAL NOT NULL,
            FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
            UNIQUE (experiment_id, model_id)
        );
        """

        with self.get_connection() as connection:
            connection.executescript(schema)

