<?php

declare(strict_types=1);

namespace Warehouse\Repositories;

use Warehouse\Core\Database;

/**
 * Repozitář pro objednávky a jejich položky.
 */
class OrderRepository
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
            'SELECT o.*, u.full_name AS created_by_name
             FROM orders o
             JOIN users u ON u.id = o.created_by_user_id
             ORDER BY o.created_at DESC'
        );

        return $statement->fetchAll();
    }

    /**
     * @return array<string, mixed>|false
     */
    public function find(int $id): array|false
    {
        $statement = $this->database->getConnection()->prepare(
            'SELECT o.*, u.full_name AS created_by_name
             FROM orders o
             JOIN users u ON u.id = o.created_by_user_id
             WHERE o.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);

        return $statement->fetch();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function itemsForOrder(int $orderId): array
    {
        $statement = $this->database->getConnection()->prepare(
            'SELECT oi.*, p.name AS product_name, p.sku AS product_sku
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = :order_id'
        );
        $statement->execute(['order_id' => $orderId]);

        return $statement->fetchAll();
    }

    /**
     * @param array<string, mixed> $orderData
     * @param list<array<string, mixed>> $items
     */
    public function create(array $orderData, array $items): int
    {
        $connection = $this->database->getConnection();
        $connection->beginTransaction();

        $orderStatement = $connection->prepare(
            'INSERT INTO orders
             (order_number, customer_name, note, status, total_price, created_by_user_id, created_at, updated_at)
             VALUES
             (:order_number, :customer_name, :note, :status, :total_price, :created_by_user_id, :created_at, :updated_at)'
        );
        $orderStatement->execute($orderData);
        $orderId = (int) $connection->lastInsertId();

        $itemStatement = $connection->prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price)
             VALUES (:order_id, :product_id, :quantity, :unit_price)'
        );

        foreach ($items as $item) {
            $itemStatement->execute([
                'order_id' => $orderId,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
            ]);
        }

        $connection->commit();

        return $orderId;
    }

    public function updateStatus(int $id, string $status): void
    {
        $statement = $this->database->getConnection()->prepare(
            'UPDATE orders
             SET status = :status, updated_at = :updated_at
             WHERE id = :id'
        );
        $statement->execute([
            'status' => $status,
            'updated_at' => date('c'),
            'id' => $id,
        ]);
    }

    public function count(): int
    {
        return (int) $this->database->getConnection()->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    }
}

