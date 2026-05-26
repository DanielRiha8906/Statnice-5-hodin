from __future__ import annotations

from abc import ABC, abstractmethod

from contact_manager.models import Contact
from contact_manager.repository import SQLiteContactRepository


class Command(ABC):
    """Command interface for action execution and undo."""

    @abstractmethod
    def execute(self) -> Contact | None:
        raise NotImplementedError

    @abstractmethod
    def undo(self) -> None:
        raise NotImplementedError


class AddContactCommand(Command):
    def __init__(self, repository: SQLiteContactRepository, contact: Contact) -> None:
        self._repository = repository
        self._contact = contact
        self._created_contact: Contact | None = None

    def execute(self) -> Contact:
        self._created_contact = self._repository.add(self._contact)
        return self._created_contact

    def undo(self) -> None:
        if self._created_contact is not None and self._created_contact.contact_id is not None:
            self._repository.delete(self._created_contact.contact_id)


class UpdateContactCommand(Command):
    def __init__(self, repository: SQLiteContactRepository, updated_contact: Contact) -> None:
        self._repository = repository
        self._updated_contact = updated_contact
        self._original_contact: Contact | None = None

    def execute(self) -> Contact:
        if self._updated_contact.contact_id is None:
            raise ValueError("Cannot update a contact without an id.")

        self._original_contact = self._repository.get(self._updated_contact.contact_id)
        if self._original_contact is None:
            raise ValueError("Contact not found.")

        self._repository.update(self._updated_contact)
        return self._updated_contact

    def undo(self) -> None:
        if self._original_contact is not None:
            self._repository.update(self._original_contact)


class DeleteContactCommand(Command):
    def __init__(self, repository: SQLiteContactRepository, contact_id: int) -> None:
        self._repository = repository
        self._contact_id = contact_id
        self._deleted_contact: Contact | None = None

    def execute(self) -> Contact | None:
        self._deleted_contact = self._repository.delete(self._contact_id)
        return self._deleted_contact

    def undo(self) -> None:
        if self._deleted_contact is not None:
            restored = self._repository.add(self._deleted_contact.clone(contact_id=None))
            self._deleted_contact = restored


class CommandManager:
    """Stores command history and supports undo."""

    def __init__(self) -> None:
        self._history: list[Command] = []

    def execute(self, command: Command) -> Contact | None:
        result = command.execute()
        self._history.append(command)
        return result

    def undo_last(self) -> bool:
        if not self._history:
            return False

        command = self._history.pop()
        command.undo()
        return True
