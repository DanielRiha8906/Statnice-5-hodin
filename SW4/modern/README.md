# SkladPro Modern - FastAPI + React

Tato složka obsahuje druhou variantu stejného skladového systému jako v `SW4/`, tentokrát postavenou moderněji:

- backend: `FastAPI`
- frontend: `React` + `Vite` + `Tailwind CSS`
- databáze: `SQLite` přes `SQLAlchemy`

Je to dobré jako alternativní odevzdání nebo jako srovnání klasické server-rendered PHP aplikace s odděleným REST API a SPA frontendem.

## Co varianta umí

1. Přihlášení přes API a Bearer token.
2. Role `admin` a `worker`.
3. Dashboard se statistikami a low-stock upozorněními.
4. CRUD produktů.
5. Tvorbu objednávek a změnu jejich stavů.
6. Automatické snížení skladové zásoby při vytvoření objednávky.
7. Správu uživatelů pro administrátora.

## Struktura

- `backend/`
  FastAPI server, databázové modely, seed, autentizace a REST API.
- `frontend/`
  React klient, který komunikuje s backendem přes HTTP.
- `docs/`
  Databázová dokumentace, ER diagram a tahák k obhajobě.

## Spuštění backendu

V adresáři `SW4/modern/backend`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Backend poběží na:

```text
http://127.0.0.1:8001
```

OpenAPI dokumentace:

```text
http://127.0.0.1:8001/docs
```

## Spuštění frontendu

V adresáři `SW4/modern/frontend`:

```bash
npm install
npm run dev
```

Frontend poběží na:

```text
http://127.0.0.1:5173
```

## Výchozí účty

- `admin / admin123`
- `worker / worker123`

## Testy backendu

V adresáři `SW4/modern/backend` lze spustit:

```bash
pytest
```

Testy pokrývají:

- přihlášení,
- autorizaci,
- dashboard,
- vytvoření produktu,
- vytvoření objednávky a snížení zásoby,
- správu uživatelů pouze pro admina.

## Další dokumentace

- databázový návrh: [docs/DATABASE.md](/home/aerceas/Documents/STATNICE/Příprava/SW4/modern/docs/DATABASE.md)
- tahák k obhajobě: [docs/OBHAJOBA.md](/home/aerceas/Documents/STATNICE/Příprava/SW4/modern/docs/OBHAJOBA.md)

## Bezpečnost

- Přístupy do chráněných endpointů vyžadují Bearer token.
- Role `admin` omezuje práci s uživateli a mazání produktů.
- Databázová vrstva používá ORM, takže se přirozeně snižuje riziko SQL injection.

## Poznámka k hashování hesel

Pro jednoduchost projektu je použité hashování přes `sha256`. Pro produkční systém by bylo vhodnější `bcrypt` nebo `argon2`.
