# SW1 - Sprava kontaktu

Zakladni konzolova aplikace pro spravu kontaktu podle zadani k navrhovym vzorum. Projekt je pripraveny v Pythonu a pouziva lokalni SQLite databazi, takze neni potreba Docker ani externi databazovy server.

## Struktura projektu

```text
SW1/
├── data/                     # SQLite databaze se vytvori sem pri prvnim spusteni
├── src/
│   ├── contact_manager/
│   │   ├── app.py            # Konzolove menu
│   │   ├── commands.py       # Navrhovy vzor Command + undo
│   │   ├── iterator.py       # Navrhovy vzor Iterator
│   │   ├── models.py         # Entita Contact + Prototype
│   │   ├── repository.py     # SQLite vrstva
│   │   └── service.py        # Aplikacni logika
│   └── main.py               # Spousteci soubor
└── tests/
    └── test_contact_manager.py
```

## Pouzite navrhove vzory

- `Prototype`: trida `Contact` umi vytvorit kopii pres metodu `clone(...)`.
- `Command`: operace pridani, upravy a smazani jsou zapouzdreny do prikazu a lze vratit posledni zmenu.
- `Iterator`: trida `ContactCollection` vraci vlastni iterator pro pruchod seznamem kontaktu.

## Spusteni aplikace

Z korene slozky `SW1` muzes pouzit nejsnazsi variantu:

```bash
python3 main.py
```

Pripadne funguji i tyto varianty:

```bash
python3 -m main
PYTHONPATH=src python3 -m contact_manager
PYTHONPATH=src python3 src/main.py
```

Po spusteni se automaticky vytvori soubor `data/contacts.db`.

## Spusteni testu

```bash
PYTHONPATH=src python3 -m unittest discover -s tests
```

## Co uz zaklad umi

- pridat kontakt
- vypsat kontakty
- vyhledavat podle jmena, telefonu, e-mailu nebo poznamky
- upravit kontakt
- smazat kontakt
- vratit posledni operaci
- ukladat data do SQLite databaze

## Doporucene dalsi kroky

- doplnit validace vstupu
- pridat vice testu pro chybove scenare
- rozsirit dokumentaci o kratkou uzivatelskou prirucku do odevzdani
