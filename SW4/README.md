# SkladPro - PHP skladový systém

Tento projekt je webová aplikace v jazyce PHP pro správu skladu. Aplikace byla vytvořená jako studijní ukázka ke státnicím a splňuje požadavky zadání: produkty, objednávky, sledování zásob, role uživatelů, relační databáze a jednoduché API.

Vedle této klasické PHP varianty je v [modern/README.md](/home/aerceas/Documents/STATNICE/Příprava/SW4/modern/README.md) připravená i druhá implementace stejného systému pomocí `FastAPI + React`.

## Co aplikace umí

1. Přihlášení uživatele do systému.
2. Role `správce` a `skladník`.
3. CRUD nad produkty:
   přidání, úprava, smazání, výpis.
4. Správu objednávek:
   vytvoření objednávky, přehled, změna stavu, detail.
5. Automatické snižování zásoby při vytvoření objednávky.
6. Upozornění na nízký stav zásob.
7. JSON API pro produkty, objednávky a stock alerty.
8. Ochranu proti SQL injection přes PDO prepared statements.

## Zvolený kontext skladu

Aplikace je zasazená do kontextu skladu vybavení pro stavebnictví.

## Použité technologie

- PHP 8+
- PDO
- SQLite
- HTML + jednoduché CSS

SQLite je relační databáze. Pro školní projekt má výhodu, že není potřeba samostatný server. Pokud bys chtěl databázi změnit na MySQL, stačí upravit vrstvu připojení v `src/Core/Database.php`.

## Struktura projektu

- `public/index.php`
  Vstupní bod aplikace a registrace rout.
- `config/config.php`
  Konfigurace aplikace.
- `src/Core/`
  Základní infrastruktura, databáze, router, base controller.
- `src/Controllers/`
  Kontrolery jednotlivých částí systému.
- `src/Repositories/`
  Databázová logika a SQL dotazy.
- `src/Services/AuthService.php`
  Přihlášení, session, role.
- `src/Views/`
  Šablony uživatelského rozhraní.
- `data/warehouse.sqlite`
  Databázový soubor vytvořený při prvním spuštění.

## Spuštění aplikace

Před prvním spuštěním ověř, že tvoje PHP má načtené moduly `PDO`, `pdo_sqlite` a ideálně i `sqlite3`:

```bash
php -m | grep -i sqlite
```

Pokud příkaz nic nevrátí, aplikace nemůže otevřít souborovou SQLite databázi a skončí chybou `could not find driver`.

V adresáři `SW4` spusť:

```bash
php -S localhost:8000 -t public
```

Potom otevři:

```text
http://localhost:8000
```

## Výchozí přihlašovací údaje

- uživatel: `admin`
- heslo: `admin123`

## Uživatelská příručka

### 1. Přihlášení

1. Otevři aplikaci v prohlížeči.
2. Přihlas se výchozím účtem správce.

### 2. Produkty

1. V menu otevři `Produkty`.
2. Přidej nový produkt přes `Přidat produkt`.
3. U existujícího produktu můžeš provést úpravu.
4. Správce může produkt také smazat.

### 3. Objednávky

1. V menu otevři `Objednávky`.
2. Přes `Nová objednávka` založ novou objednávku.
3. Vyber produkt, množství a zákazníka.
4. Po uložení se zásoba produktu automaticky sníží.
5. Stav objednávky lze změnit v seznamu objednávek.

### 4. Uživatelé

1. Správce může otevřít sekci `Uživatelé`.
2. Zde může zakládat další účty a přiřazovat role `správce` nebo `skladník`.

### 5. Low-stock upozornění

- Na dashboardu se zobrazuje seznam produktů, které mají zásobu menší nebo rovnou definovanému limitu.

### 6. API

Po přihlášení lze použít tyto endpointy:

- `/api/products`
- `/api/orders`
- `/api/stock-alerts`

Vrací data ve formátu JSON.

## Bezpečnostní poznámky

- SQL dotazy používají prepared statements přes PDO.
- Hesla jsou hashovaná pomocí `password_hash`.
- Přístup do chráněných částí je omezen pomocí session.
- Role `admin` a `worker` mají odlišná oprávnění.

## Omezení a možné rozšíření

- API je nyní session-based a jednoduché.
- Pro produkční nasazení by bylo vhodné doplnit CSRF tokeny, robustnější validaci, stránkování a auditní log.
- Objednávka v této verzi obsahuje jednu produktovou položku, ale databázové schéma už podporuje více položek.
