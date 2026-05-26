# Databázová dokumentace

Tato aplikace používá relační databázi SQLite přes PDO. Schéma je navržené tak, aby pokrylo produkty, objednávky, zásoby i uživatele s rolemi.

## Požadavky prostředí

PHP musí mít aktivní SQLite ovladač pro PDO, tedy modul `pdo_sqlite` a obvykle také `sqlite3`. Bez něj se aplikace nespustí a při vytváření `PDO('sqlite:...')` skončí chybou `could not find driver`.

## Tabulky

### `users`

Ukládá účty uživatelů systému.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `username` | `TEXT` | Přihlašovací jméno, unikátní |
| `password_hash` | `TEXT` | Hash hesla |
| `full_name` | `TEXT` | Celé jméno uživatele |
| `role` | `TEXT` | Role `admin` nebo `worker` |
| `created_at` | `TEXT` | Datum vytvoření |

### `products`

Ukládá produkty a jejich zásoby.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `name` | `TEXT` | Název produktu |
| `category` | `TEXT` | Kategorie produktu |
| `sku` | `TEXT` | Jedinečný skladový kód |
| `description` | `TEXT` | Popis produktu |
| `price` | `REAL` | Cena za kus |
| `quantity_in_stock` | `INTEGER` | Aktuální stav na skladě |
| `low_stock_threshold` | `INTEGER` | Mez pro low-stock upozornění |
| `created_at` | `TEXT` | Datum vytvoření |
| `updated_at` | `TEXT` | Datum poslední změny |

### `orders`

Ukládá hlavičky objednávek.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `order_number` | `TEXT` | Jedinečné číslo objednávky |
| `customer_name` | `TEXT` | Jméno zákazníka |
| `note` | `TEXT` | Poznámka |
| `status` | `TEXT` | Stav objednávky |
| `total_price` | `REAL` | Celková cena |
| `created_by_user_id` | `INTEGER` | Autor objednávky |
| `created_at` | `TEXT` | Datum vytvoření |
| `updated_at` | `TEXT` | Datum poslední změny |

### `order_items`

Ukládá položky objednávky.

| Sloupec | Typ | Význam |
|---|---|---|
| `id` | `INTEGER` | Primární klíč |
| `order_id` | `INTEGER` | Vazba na objednávku |
| `product_id` | `INTEGER` | Vazba na produkt |
| `quantity` | `INTEGER` | Počet kusů |
| `unit_price` | `REAL` | Jednotková cena v době objednávky |

## Vazby

- `users (1) -> (N) orders`
- `orders (1) -> (N) order_items`
- `products (1) -> (N) order_items`

Tím vzniká nepřímá vazba `M:N` mezi objednávkami a produkty přes `order_items`.

## Integritní omezení

- `users.username` je unikátní.
- `products.sku` je unikátní.
- `orders.order_number` je unikátní.
- cizí klíče jsou aktivní přes `PRAGMA foreign_keys = ON`.
- `order_items` se mažou s objednávkou přes `ON DELETE CASCADE`.

## Bezpečnostní a návrhové poznámky

- Přístup do databáze probíhá přes PDO.
- Dotazy s uživatelským vstupem používají prepared statements.
- Hesla nejsou uložena v otevřené podobě, ale jako hash.
- Datový model je normalizovaný:
  uživatelé, produkty, objednávky a položky objednávek jsou oddělené entity.
