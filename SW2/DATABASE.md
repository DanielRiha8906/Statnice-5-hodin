# Databázová dokumentace

Tato aplikace používá relační databázi SQLite. Přestože zadání uvádí například MySQL, SQLite je také relační databáze a pro školní desktopovou aplikaci má výhodu jednoduchého spuštění bez instalace serveru.

## Přehled tabulek

### 1. `experiments`

Ukládá základní informace o experimentech.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `name` | `TEXT` | Název experimentu, unikátní |
| `description` | `TEXT` | Textový popis experimentu |

### 2. `models`

Ukládá definice modelů.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `model_type` | `TEXT` | Typ modelu, například `RandomForestClassifier` nebo `SVC` |
| `name` | `TEXT` | Jméno modelu, unikátní |
| `description` | `TEXT` | Popis modelu |

### 3. `model_parameters`

Ukládá konfigurační parametry modelů.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `model_id` | `INTEGER` | Cizí klíč do tabulky `models` |
| `parameter_name` | `TEXT` | Název parametru |
| `parameter_value` | `TEXT` | Hodnota parametru uložená textově |

### 4. `experiment_results`

Spojovací tabulka mezi experimentem a modelem. Obsahuje i výsledné skóre.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `experiment_id` | `INTEGER` | Cizí klíč do tabulky `experiments` |
| `model_id` | `INTEGER` | Cizí klíč do tabulky `models` |
| `result_value` | `REAL` | Výsledné číselné skóre modelu |

## Vazby mezi tabulkami

- `models (1) -> (N) model_parameters`
  Jeden model má více parametrů.
- `experiments (1) -> (N) experiment_results`
  Jeden experiment může obsahovat více přiřazených modelů.
- `models (1) -> (N) experiment_results`
  Jeden model může být použit ve více experimentech.

Z toho plyne vztah `M:N` mezi experimenty a modely, který je realizovaný přes tabulku `experiment_results`.

## Integritní omezení

- `experiments.name` je unikátní.
- `models.name` je unikátní.
- kombinace `experiment_id + model_id` v tabulce `experiment_results` je unikátní.
- cizí klíče jsou zapnuté pomocí `PRAGMA foreign_keys = ON`.
- při smazání modelu se smažou i jeho parametry díky `ON DELETE CASCADE`.

## Ukázka ER logiky

1. Nejdříve založíme experiment.
2. Poté založíme model.
3. K modelu uložíme parametry do samostatné tabulky.
4. Nakonec model přiřadíme do experimentu a uložíme výsledek.

Takové řešení je normalizovanější než ukládání všeho do jedné tabulky a lépe odpovídá relačnímu návrhu databáze.
