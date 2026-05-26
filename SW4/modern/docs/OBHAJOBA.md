# Tahák k obhajobě - FastAPI + React varianta

Tento dokument slouží jako stručný tahák k ústní obhajobě moderní varianty skladového systému.

## 1. Co je cílem aplikace

Cílem aplikace je správa skladu:

- evidence produktů,
- sledování stavu zásob,
- tvorba objednávek,
- správa uživatelů,
- upozornění na nízký stav zásob,
- a zpřístupnění dat přes API.

## 2. Proč jsem zvolil FastAPI + React

Tento stack je vhodný, pokud chci oddělit backend a frontend.

- `FastAPI` poskytuje rychlé REST API, automatickou dokumentaci a typovou podporu.
- `React` umožňuje postavit interaktivní klientské rozhraní.
- Backend a frontend lze nasazovat i škálovat odděleně.

U klasického PHP řešení je HTML renderované na serveru, zatímco zde frontend komunikuje s backendem přes HTTP JSON API.

## 3. Architektura řešení

Architektura je rozdělena na dvě samostatné části:

1. Backend
   FastAPI aplikace poskytuje endpointy, pracuje s databází a řeší autentizaci.
2. Frontend
   React aplikace zobrazuje dashboard, formuláře a tabulky a posílá požadavky na backend.

Na backendu jsou oddělené vrstvy:

- `models.py`
  databázové entity
- `schemas.py`
  validační a přenosové modely
- `services.py`
  aplikační logika
- `security.py`
  autentizace a autorizace
- `main.py`
  registrace endpointů

## 4. Databázový návrh

Používám relační databázi SQLite přes SQLAlchemy ORM.

Hlavní tabulky:

- `users`
- `products`
- `orders`
- `order_items`
- `auth_tokens`

Vztah mezi objednávkami a produkty je `M:N`, realizovaný přes tabulku `order_items`.

To je důležité, protože jedna objednávka může obsahovat více produktů a jeden produkt může být součástí více objednávek.

## 5. Jak fungují role a oprávnění

V systému jsou dvě role:

- `admin`
- `worker`

Rozdíl oprávnění:

- `admin` může vytvářet uživatele a mazat produkty
- `worker` může pracovat s produkty a objednávkami, ale nemůže spravovat účty

Na backendu je to řešeno dependency funkcí `require_admin`.

## 6. Jak je řešená bezpečnost

Bezpečnost jsem řešil ve třech hlavních rovinách:

1. Autentizace
   Uživatel se přihlásí a dostane Bearer token.
2. Autorizace
   Některé endpointy jsou dostupné jen administrátorovi.
3. Ochrana proti SQL injection
   Přístup do databáze jde přes SQLAlchemy ORM, takže se neřetězí raw SQL z uživatelského vstupu.

Hesla nejsou ukládána v otevřené podobě, ale jako hash.

## 7. Jak funguje low-stock upozornění

Každý produkt má:

- `quantity_in_stock`
- `low_stock_threshold`

Pokud je aktuální stav menší nebo roven limitu, produkt je označen jako low-stock.

To se využívá:

- v dashboardu,
- v seznamu produktů,
- a v endpointu `/stock-alerts`.

## 8. Jak fungují objednávky

Při vytvoření objednávky backend:

1. ověří, že produkty existují,
2. zkontroluje, že je na skladě dost kusů,
3. vytvoří objednávku a její položky,
4. odečte objednané množství ze skladu,
5. spočítá celkovou cenu.

To je důležité zdůraznit, protože právě tady se propojuje obchodní logika s datovým modelem skladu.

## 9. Jaké API endpointy aplikace má

Hlavní endpointy:

- `POST /auth/login`
- `GET /dashboard`
- `GET /products`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `GET /orders`
- `POST /orders`
- `PATCH /orders/{id}/status`
- `GET /users`
- `POST /users`

FastAPI navíc automaticky generuje dokumentaci v `/docs`.

## 10. Jak jsem ověřoval funkčnost

Připravil jsem integrační testy backendu:

- test přihlášení,
- test autorizace,
- test dashboardu,
- test vytvoření produktu,
- test vytvoření objednávky a snížení zásob,
- test omezení správy uživatelů jen pro admina.

To je silný argument při obhajobě, protože ukazuje, že aplikace není jen napsaná, ale i ověřená.

## 11. Co bych rozšířil v produkční verzi

Pokud by šlo o produkční systém, doplnil bych:

- silnější hashování hesel přes `bcrypt` nebo `argon2`,
- expirační logiku tokenů,
- stránkování a filtrování seznamů,
- auditní log změn,
- validaci duplicit při update operacích,
- a pokročilejší frontend routing.

## 12. Jednověté shrnutí k obhajobě

Vytvořil jsem skladový systém s odděleným REST backendem a React frontendem, relační databází, rolemi, bezpečností, low-stock hlídáním a testovanou obchodní logikou objednávek.

