from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from contact_manager.models import Contact
from contact_manager.service import ContactService


class ContactManagerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "test_contacts.db"
        self.service = ContactService(self.db_path)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_prototype_clone_creates_modified_copy(self) -> None:
        original = Contact(contact_id=1, name="Alice", phone="123", email="a@b.cz", note="vip")

        clone = original.clone(name="Alice Novak")

        self.assertEqual(clone.name, "Alice Novak")
        self.assertEqual(clone.phone, "123")
        self.assertEqual(original.name, "Alice")

    def test_add_and_iterate_contacts(self) -> None:
        self.service.add_contact("Alice", "123", "alice@example.com", "kamka")
        self.service.add_contact("Bob", "456", "bob@example.com", "prace")

        contacts = list(self.service.list_contacts())

        self.assertEqual(len(contacts), 2)
        self.assertEqual([contact.name for contact in contacts], ["Alice", "Bob"])

    def test_update_and_undo(self) -> None:
        created = self.service.add_contact("Alice", "123", "alice@example.com", "")

        self.service.update_contact(created.contact_id, "Alice Novak", "999", "alice@example.com", "upraveno")
        updated = self.service.get_contact(created.contact_id)
        assert updated is not None
        self.assertEqual(updated.phone, "999")

        undone = self.service.undo_last_action()
        reverted = self.service.get_contact(created.contact_id)

        self.assertTrue(undone)
        assert reverted is not None
        self.assertEqual(reverted.name, "Alice")
        self.assertEqual(reverted.phone, "123")

    def test_delete_and_undo(self) -> None:
        created = self.service.add_contact("Alice", "123", "alice@example.com", "")

        self.service.delete_contact(created.contact_id)
        self.assertIsNone(self.service.get_contact(created.contact_id))

        undone = self.service.undo_last_action()
        contacts = list(self.service.list_contacts())

        self.assertTrue(undone)
        self.assertEqual(len(contacts), 1)
        self.assertEqual(contacts[0].name, "Alice")


if __name__ == "__main__":
    unittest.main()
