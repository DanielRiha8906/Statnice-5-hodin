<?php

declare(strict_types=1);

namespace Warehouse\Controllers;

use Warehouse\Core\Controller;

/**
 * Jednoduché JSON API pro externí integrace.
 */
class ApiController extends Controller
{
    public function products(): void
    {
        $this->requireLogin();
        $this->respondJson([
            'data' => $this->productRepository->all(),
        ]);
    }

    public function orders(): void
    {
        $this->requireLogin();
        $orders = $this->orderRepository->all();
        foreach ($orders as &$order) {
            $order['items'] = $this->orderRepository->itemsForOrder((int) $order['id']);
        }
        unset($order);

        $this->respondJson([
            'data' => $orders,
        ]);
    }

    public function stockAlerts(): void
    {
        $this->requireLogin();
        $this->respondJson([
            'data' => $this->productRepository->lowStockProducts(),
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function respondJson(array $payload): void
    {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}

