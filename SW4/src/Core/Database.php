<?php

declare(strict_types=1);

namespace Warehouse\Core;

use PDO;
use PDOException;
use RuntimeException;

/**
 * Zapouzdřuje vytvoření PDO spojení a inicializaci databáze.
 */
class Database
{
    private PDO $connection;

    /**
     * @param array<string, string> $configuration
     */
    public function __construct(private readonly array $configuration)
    {
        $this->initializeConnection();
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }

    /**
     * Vytvoří tabulky aplikace.
     *
     * Používáme relační model s jasně oddělenými entitami:
     * - users,
     * - products,
     * - orders,
     * - order_items.
     *
     * Sloupec `quantity_in_stock` přímo reprezentuje aktuální zásobu produktu.
     */
    public function migrate(): void
    {
        $schema = <<<SQL
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            sku TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            quantity_in_stock INTEGER NOT NULL,
            low_stock_threshold INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT NOT NULL UNIQUE,
            customer_name TEXT NOT NULL,
            note TEXT NOT NULL,
            status TEXT NOT NULL,
            total_price REAL NOT NULL,
            created_by_user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
        SQL;

        $this->connection->exec($schema);
    }

    /**
     * Naplní databázi výchozím adminem a několika produkty.
     *
     * Seed děláme jen tehdy, pokud je databáze zatím prázdná.
     */
    public function seedDefaultData(): void
    {
        $userCount = (int) $this->connection->query('SELECT COUNT(*) FROM users')->fetchColumn();

        if ($userCount > 0) {
            return;
        }

        $createdAt = date('c');

        $userStatement = $this->connection->prepare(
            'INSERT INTO users (username, password_hash, full_name, role, created_at)
             VALUES (:username, :password_hash, :full_name, :role, :created_at)'
        );

        $userStatement->execute([
            'username' => 'admin',
            'password_hash' => password_hash('admin123', PASSWORD_DEFAULT),
            'full_name' => 'Výchozí správce',
            'role' => 'admin',
            'created_at' => $createdAt,
        ]);

        $products = [
            ['Aku vrtačka', 'Stavebnictví', 'TOOL-001', 'Profesionální aku vrtačka 18V', 3490.00, 12, 5],
            ['Brusný kotouč', 'Stavebnictví', 'TOOL-002', 'Kotouč pro úhlovou brusku', 129.00, 4, 6],
            ['Ochranné rukavice', 'Bezpečnost', 'SAFE-001', 'Pracovní rukavice velikost L', 89.00, 40, 10],
        ];

        $productStatement = $this->connection->prepare(
            'INSERT INTO products
            (name, category, sku, description, price, quantity_in_stock, low_stock_threshold, created_at, updated_at)
            VALUES
            (:name, :category, :sku, :description, :price, :quantity_in_stock, :low_stock_threshold, :created_at, :updated_at)'
        );

        foreach ($products as $product) {
            $productStatement->execute([
                'name' => $product[0],
                'category' => $product[1],
                'sku' => $product[2],
                'description' => $product[3],
                'price' => $product[4],
                'quantity_in_stock' => $product[5],
                'low_stock_threshold' => $product[6],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }

    private function initializeConnection(): void
    {
        $databasePath = $this->configuration['database'];
        $databaseDirectory = dirname($databasePath);

        if (!is_dir($databaseDirectory)) {
            mkdir($databaseDirectory, 0777, true);
        }

        if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            throw new RuntimeException(
                'SQLite PDO driver is not available. Enable the pdo_sqlite/sqlite3 PHP extension and restart the PHP server.'
            );
        }

        try {
            $this->connection = new PDO('sqlite:' . $databasePath);
        } catch (PDOException $exception) {
            throw new RuntimeException(
                'Failed to connect to the SQLite database at "' . $databasePath . '".',
                0,
                $exception
            );
        }

        $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->connection->exec('PRAGMA foreign_keys = ON');
    }
}
