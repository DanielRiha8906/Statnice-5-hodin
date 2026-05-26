<?php

declare(strict_types=1);

namespace Warehouse\Repositories;

use PDO;
use Warehouse\Core\Database;

/**
 * Repozitář pro práci s produkty a zásobami.
 */
class ProductRepository
{
    public function __construct(private readonly Database $database)
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function all(): array
    {
        $statement = $this->database->getConnection()->query(
            'SELECT *,
                CASE WHEN quantity_in_stock <= low_stock_threshold THEN 1 ELSE 0 END AS is_low_stock
             FROM products
             ORDER BY updated_at DESC, name ASC'
        );

        return $statement->fetchAll();
    }

    /**
     * @return array<string, mixed>|false
     */
    public function find(int $id): array|false
    {
        $statement = $this->database->getConnection()->prepare(
            'SELECT * FROM products WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);

        return $statement->fetch();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): void
    {
        $statement = $this->database->getConnection()->prepare(
            'INSERT INTO products
             (name, category, sku, description, price, quantity_in_stock, low_stock_threshold, created_at, updated_at)
             VALUES
             (:name, :category, :sku, :description, :price, :quantity_in_stock, :low_stock_threshold, :created_at, :updated_at)'
        );
        $statement->execute($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(int $id, array $data): void
    {
        $data['id'] = $id;

        $statement = $this->database->getConnection()->prepare(
            'UPDATE products
             SET name = :name,
                 category = :category,
                 sku = :sku,
                 description = :description,
                 price = :price,
                 quantity_in_stock = :quantity_in_stock,
                 low_stock_threshold = :low_stock_threshold,
                 updated_at = :updated_at
             WHERE id = :id'
        );
        $statement->execute($data);
    }

    public function delete(int $id): void
    {
        $statement = $this->database->getConnection()->prepare(
            'DELETE FROM products WHERE id = :id'
        );
        $statement->execute(['id' => $id]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function lowStockProducts(): array
    {
        $statement = $this->database->getConnection()->query(
            'SELECT *
             FROM products
             WHERE quantity_in_stock <= low_stock_threshold
             ORDER BY quantity_in_stock ASC, name ASC'
        );

        return $statement->fetchAll();
    }

    /**
     * Upraví zásobu produktu o danou hodnotu.
     *
     * Záporné číslo snižuje zásobu, kladné ji navyšuje.
     */
    public function changeStock(int $productId, int $delta): void
    {
        $statement = $this->database->getConnection()->prepare(
            'UPDATE products
             SET quantity_in_stock = quantity_in_stock + :delta,
                 updated_at = :updated_at
             WHERE id = :id'
        );
        $statement->execute([
            'delta' => $delta,
            'updated_at' => date('c'),
            'id' => $productId,
        ]);
    }

    public function count(): int
    {
        return (int) $this->database->getConnection()->query('SELECT COUNT(*) FROM products')->fetchColumn();
    }

    public function totalStockValue(): float
    {
        $result = $this->database->getConnection()->query(
            'SELECT SUM(price * quantity_in_stock) FROM products'
        )->fetchColumn();

        return (float) ($result ?: 0);
    }
}

