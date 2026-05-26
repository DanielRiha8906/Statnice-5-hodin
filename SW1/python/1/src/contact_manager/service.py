from __future__ import annotations

from pathlib import Path

from contact_manager.commands import (
    AddContactCommand,
    CommandManager,
    DeleteContactCommand,
    UpdateContactCommand,
)
from contact_manager.iterator import ContactCollection
from contact_manager.models import Contact
from contact_manager.repository import SQLiteContactRepository


class ContactService:
    """Application facade coordinating commands, repository and UI."""

    def __init__(self, db_path: str | Path) -> None:
        self.repository = SQLiteContactRepository(db_path)
        self.command_manager = CommandManager()

    def add_contact(self, name: str, phone: str, email: str, note: str = "") -> Contact:
        contact = Contact(contact_id=None, name=name, phone=phone, email=email, note=note)
        return self.command_manager.execute(AddContactCommand(self.repository, contact))  # type: ignore[return-value]

    def update_contact(
        self, contact_id: int, name: str, phone: str, email: str, note: str = ""
    ) -> Contact:
        updated = Contact(contact_id=contact_id, name=name, phone=phone, email=email, note=note)
        return self.command_manager.execute(UpdateContactCommand(self.repository, updated))  # type: ignore[return-value]

    def delete_contact(self, contact_id: int) -> Contact | None:
        return self.command_manager.execute(DeleteContactCommand(self.repository, contact_id))

    def get_contact(self, contact_id: int) -> Contact | None:
        return self.repository.get(contact_id)

    def list_contacts(self) -> ContactCollection:
        return ContactCollection(self.repository.list_all())

    def search_contacts(self, query: str) -> ContactCollection:
        return ContactCollection(self.repository.search(query))

    def undo_last_action(self) -> bool:
        return self.command_manager.undo_last()
