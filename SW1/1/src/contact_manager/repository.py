from __future__ import annotations

import sqlite3
from pathlib import Path

from contact_manager.models import Contact


class SQLiteContactRepository:
    """Persistence layer storing contacts in a local SQLite database."""

    def __init__(self, db_path: str | Path) -> None:
        self._db_path = str(db_path)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self._db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    email TEXT NOT NULL,
                    note TEXT NOT NULL DEFAULT ''
                )
                """
            )

    def add(self, contact: Contact) -> Contact:
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO contacts (name, phone, email, note)
                VALUES (?, ?, ?, ?)
                """,
                (contact.name, contact.phone, contact.email, contact.note),
            )
            return contact.clone(contact_id=int(cursor.lastrowid))

    def get(self, contact_id: int) -> Contact | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT id, name, phone, email, note FROM contacts WHERE id = ?",
                (contact_id,),
            ).fetchone()
        return self._map_row(row) if row else None

    def list_all(self) -> list[Contact]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT id, name, phone, email, note FROM contacts ORDER BY name, id"
            ).fetchall()
        return [self._map_row(row) for row in rows]

    def search(self, query: str) -> list[Contact]:
        normalized = f"%{query.lower()}%"
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT id, name, phone, email, note
                FROM contacts
                WHERE LOWER(name) LIKE ?
                   OR LOWER(phone) LIKE ?
                   OR LOWER(email) LIKE ?
                   OR LOWER(note) LIKE ?
                ORDER BY name, id
                """,
                (normalized, normalized, normalized, normalized),
            ).fetchall()
        return [self._map_row(row) for row in rows]

    def update(self, contact: Contact) -> None:
        if contact.contact_id is None:
            raise ValueError("Cannot update a contact without an id.")

        with self._connect() as connection:
            connection.execute(
                """
                UPDATE contacts
                SET name = ?, phone = ?, email = ?, note = ?
                WHERE id = ?
                """,
                (contact.name, contact.phone, contact.email, contact.note, contact.contact_id),
            )

    def delete(self, contact_id: int) -> Contact | None:
        existing = self.get(contact_id)
        if existing is None:
            return None

        with self._connect() as connection:
            connection.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        return existing

    @staticmethod
    def _map_row(row: sqlite3.Row) -> Contact:
        return Contact(
            contact_id=int(row["id"]),
            name=str(row["name"]),
            phone=str(row["phone"]),
            email=str(row["email"]),
            note=str(row["note"]),
        )
