from __future__ import annotations

from collections.abc import Iterator

from contact_manager.models import Contact


class ContactIterator(Iterator[Contact]):
    """Iterator pattern for navigation through contacts."""

    def __init__(self, contacts: list[Contact]) -> None:
        self._contacts = contacts
        self._index = 0

    def __next__(self) -> Contact:
        if self._index >= len(self._contacts):
            raise StopIteration

        contact = self._contacts[self._index]
        self._index += 1
        return contact


class ContactCollection:
    """Aggregate returning a custom iterator."""

    def __init__(self, contacts: list[Contact]) -> None:
        self._contacts = contacts

    def __iter__(self) -> ContactIterator:
        return ContactIterator(self._contacts)
