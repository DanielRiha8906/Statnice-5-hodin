# SW1/2 - Course Management System

Tento projekt obsahuje jednoduchou konzolovou aplikaci pro správu uživatelů, kurzů a známek. Aplikace běží čistě v Pythonu, nepoužívá databázi a všechna data jsou po dobu běhu držena v paměti.

## Použité návrhové vzory

- `Strategy`: slouží pro různé způsoby výpočtu výsledné známky
- `Factory`: slouží pro vytváření uživatelů podle role
- `Observer`: slouží pro upozornění studentů na změny v kurzu

## Co aplikace umí

- registraci a přihlášení uživatelů
- rozdělení uživatelů podle rolí `Student`, `Teacher`, `Admin`
- vytváření a správu kurzů
- zapisování studentů do kurzů
- zadávání známek studentům
- výpočet výsledné známky různými strategiemi
- notifikace studentů při změně kurzu

## Struktura repozitáře

```text
SW1/2/
├── README.md
└── src/
    ├── main.py
    ├── interactive.py
    ├── models/
    │   ├── user.py
    │   ├── courses.py
    │   └── grade.py
    ├── service/
    │   ├── User_service.py
    │   └── course_service.py
    ├── strategies/
    │   ├── __init__.py
    │   ├── grading_strategy.py
    │   ├── arithmetic_mean.py
    │   ├── weighted_mean.py
    │   └── median.py
    ├── UserManager/
    │   └── user_factory.py
    └── tests/
```

## Co je kde

### `src/main.py`

Hlavní vstupní bod aplikace. Vytvoří instanci `ConsoleApp` a spustí běh programu.

### `src/interactive.py`

Obsahuje třídu `ConsoleApp`, tedy celé textové rozhraní aplikace. Řeší:

- úvodní menu
- registraci a přihlášení
- směrování podle role uživatele
- studentské, učitelské a administrátorské menu
- obsluhu vstupů z konzole

Je to vrstva, přes kterou uživatel s aplikací přímo komunikuje.

### `src/models/`

Doménové modely aplikace.

- `user.py`: obsahuje třídy `User`, `Student`, `Teacher`, `Admin`
  Slouží pro reprezentaci uživatelů a jejich rolí. Třída `Student` zde zároveň funguje jako pozorovatel, protože přijímá notifikace přes metodu `update(...)`.
- `courses.py`: obsahuje třídu `Course`
  Drží informace o kurzu, učiteli, zapsaných studentech, známkách a strategii výpočtu výsledné známky. Třída `Course` zde zároveň funguje jako subjekt ve vzoru `Observer`, protože při změně kurzu volá `notify_students(...)`.
- `grade.py`: obsahuje třídu `Grade`
  Reprezentuje jednu známku a její váhu.

### `src/service/`

Servisní vrstva, která soustřeďuje aplikační logiku.

- `User_service.py`: správa uživatelů
  Zajišťuje registraci, přihlášení, hledání, mazání a filtrování uživatelů podle role.
- `course_service.py`: správa kurzů
  Řeší vytváření kurzů, hledání, změny detailů, přidávání studentů a zapisování známek.

Tahle vrstva odděluje logiku od konzolového rozhraní.

### `src/strategies/`

Implementace strategií pro výpočet výsledné známky.

- `grading_strategy.py`: abstraktní rozhraní pro všechny strategie
- `arithmetic_mean.py`: obyčejný aritmetický průměr
- `weighted_mean.py`: vážený průměr
- `median.py`: medián
- `__init__.py`: exportuje strategie pro jednodušší import

Tato část odpovídá návrhovému vzoru `Strategy`.

### `src/UserManager/`

- `user_factory.py`: továrna na vytváření uživatelů podle role

Tento modul používá `UserFactory`, která podle zadané role vytvoří správný typ uživatele. Odpovídá návrhovému vzoru `Factory`.

## Jak je v projektu použitý Observer

Vzoru `Observer` odpovídá komunikace mezi kurzem a studenty:

- `Course` je pozorovaný objekt
- `Student` je pozorovatel
- metoda `notify_students(...)` rozesílá zprávy všem zapsaným studentům
- metoda `Student.update(...)` přijímá notifikaci a ukládá ji do seznamu `notifications`

Notifikace se spouštějí například při změně detailů kurzu v metodě `change(...)`.

### `src/tests/`

Složka určená pro testy. V aktuálním stavu je připravená jako místo pro jednotkové testy, ale podle výpisu projektu v ní zatím nejsou soubory.

## Jak aplikace funguje

1. Uživatel po spuštění zvolí registraci nebo přihlášení.
2. Po přihlášení se zobrazí menu podle role:
   `Student`, `Teacher` nebo `Admin`.
3. Jednotlivé akce volají metody servisní vrstvy.
4. Kurzy používají zvolenou strategii výpočtu známky.
5. Při změně kurzu mohou být studenti informováni přes notifikace.

## Jak spustit aplikaci

Přejdi do složky `SW1/2` a spusť:

```bash
PYTHONPATH=src python3 src/main.py
```

Pokud máš v systému příkaz `python` namísto `python3`, můžeš použít:

```bash
PYTHONPATH=src python src/main.py
```

## Jak spustit testy

Jednotkové testy jsou uložené ve složce `src/tests/`. Spuštění z kořene projektu:

```bash
PYTHONPATH=src python3 -m unittest discover -s src/tests
```

Případně:

```bash
PYTHONPATH=src python -m unittest discover -s src/tests
```

## Poznámky ke spuštění

- Projekt momentálně používá pouze paměť aplikace, takže po ukončení běhu se data neukládají.
- Pro správný import modulů je potřeba mít nastavené `PYTHONPATH=src`.
- Složky `__pycache__` obsahují automaticky generované cache soubory Pythonu a není potřeba je ručně upravovat.

## Doporučení pro další rozvoj

- doplnit jednotkové testy do `src/tests/`
- přidat perzistenci dat do souboru nebo databáze
- sjednotit pojmenování souborů, například `User_service.py` na `user_service.py`
- doplnit validace vstupů a ošetření chybových stavů
