from __future__ import annotations

from pathlib import Path

from contact_manager.models import Contact
from contact_manager.service import ContactService


def _print_contact(contact: Contact) -> None:
    print(
        f"[{contact.contact_id}] {contact.name} | tel: {contact.phone} | "
        f"email: {contact.email} | poznamka: {contact.note}"
    )


def _read_contact_data(existing: Contact | None = None) -> tuple[str, str, str, str]:
    name = input(f"Jmeno [{existing.name if existing else ''}]: ").strip() or (
        existing.name if existing else ""
    )
    phone = input(f"Telefon [{existing.phone if existing else ''}]: ").strip() or (
        existing.phone if existing else ""
    )
    email = input(f"E-mail [{existing.email if existing else ''}]: ").strip() or (
        existing.email if existing else ""
    )
    note = input(f"Poznamka [{existing.note if existing else ''}]: ").strip() or (
        existing.note if existing else ""
    )
    return name, phone, email, note


def main() -> None:
    base_dir = Path(__file__).resolve().parents[2]
    db_path = base_dir / "data" / "contacts.db"
    service = ContactService(db_path)

    actions = {
        "1": "Vypsat kontakty",
        "2": "Pridat kontakt",
        "3": "Vyhledat kontakt",
        "4": "Upravit kontakt",
        "5": "Smazat kontakt",
        "6": "Vratit posledni zmenu",
        "0": "Konec",
    }

    while True:
        print("\n=== Sprava kontaktu ===")
        for key, label in actions.items():
            print(f"{key}. {label}")

        choice = input("Zvol akci: ").strip()

        if choice == "1":
            contacts = list(service.list_contacts())
            if not contacts:
                print("Seznam kontaktu je prazdny.")
                continue
            for contact in contacts:
                _print_contact(contact)
        elif choice == "2":
            name, phone, email, note = _read_contact_data()
            created = service.add_contact(name, phone, email, note)
            print("Kontakt ulozen:")
            _print_contact(created)
        elif choice == "3":
            query = input("Zadej hledany text: ").strip()
            results = list(service.search_contacts(query))
            if not results:
                print("Nebyl nalezen zadny kontakt.")
                continue
            for contact in results:
                _print_contact(contact)
        elif choice == "4":
            try:
                contact_id = int(input("ID kontaktu pro upravu: ").strip())
            except ValueError:
                print("ID musi byt cislo.")
                continue

            existing = service.get_contact(contact_id)
            if existing is None:
                print("Kontakt nebyl nalezen.")
                continue

            name, phone, email, note = _read_contact_data(existing)
            updated = service.update_contact(contact_id, name, phone, email, note)
            print("Kontakt upraven:")
            _print_contact(updated)
        elif choice == "5":
            try:
                contact_id = int(input("ID kontaktu pro smazani: ").strip())
            except ValueError:
                print("ID musi byt cislo.")
                continue

            deleted = service.delete_contact(contact_id)
            if deleted is None:
                print("Kontakt nebyl nalezen.")
            else:
                print("Kontakt smazan.")
        elif choice == "6":
            if service.undo_last_action():
                print("Posledni operace byla vracena.")
            else:
                print("Neni co vratit.")
        elif choice == "0":
            print("Aplikace ukoncena.")
            break
        else:
            print("Neplatna volba.")


if __name__ == "__main__":
    main()
