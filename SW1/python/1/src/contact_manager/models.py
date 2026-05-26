from __future__ import annotations

from dataclasses import dataclass, replace


@dataclass(slots=True)
class Contact:
    """Entity representing one contact and its prototype clone operation."""

    contact_id: int | None
    name: str
    phone: str
    email: str
    note: str = ""

    def clone(self, **changes: object) -> "Contact":
        """Prototype pattern: create a copy with optional field overrides."""
        return replace(self, **changes)
