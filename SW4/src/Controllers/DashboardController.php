<?php

declare(strict_types=1);

namespace Warehouse\Controllers;

use Warehouse\Core\Controller;

/**
 * Úvodní přehled skladu.
 */
class DashboardController extends Controller
{
    public function index(): void
    {
        $this->requireLogin();

        $this->render('dashboard/index', [
            'flash' => $this->getFlash(),
            'productCount' => $this->productRepository->count(),
            'orderCount' => $this->orderRepository->count(),
            'lowStockProducts' => $this->productRepository->lowStockProducts(),
            'totalStockValue' => $this->productRepository->totalStockValue(),
            'recentOrders' => array_slice($this->orderRepository->all(), 0, 5),
            'orderStatuses' => $this->config['order_statuses'],
        ]);
    }
}
