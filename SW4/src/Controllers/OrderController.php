<?php

declare(strict_types=1);

namespace Warehouse\Controllers;

use Warehouse\Core\Controller;

/**
 * Správa objednávek a jejich stavů.
 */
class OrderController extends Controller
{
    public function index(): void
    {
        $this->requireLogin();

        $orders = $this->orderRepository->all();
        foreach ($orders as &$order) {
            $order['items'] = $this->orderRepository->itemsForOrder((int) $order['id']);
        }
        unset($order);

        $this->render('orders/index', [
            'flash' => $this->getFlash(),
            'orders' => $orders,
            'orderStatuses' => $this->config['order_statuses'],
        ]);
    }

    public function create(): void
    {
        $this->requireLogin();

        $this->render('orders/create', [
            'flash' => $this->getFlash(),
            'products' => $this->productRepository->all(),
        ]);
    }

    public function store(): void
    {
        $this->requireLogin();

        $customerName = $this->input('customer_name');
        $note = $this->input('note');
        $productId = (int) ($_POST['product_id'] ?? 0);
        $quantity = (int) ($_POST['quantity'] ?? 0);

        if ($customerName === '' || $productId <= 0 || $quantity <= 0) {
            $this->setFlash('error', 'Objednávka musí obsahovat zákazníka, produkt a množství.');
            $this->redirect('/orders/create');
        }

        $product = $this->productRepository->find($productId);
        if (!$product) {
            $this->setFlash('error', 'Vybraný produkt neexistuje.');
            $this->redirect('/orders/create');
        }

        if ((int) $product['quantity_in_stock'] < $quantity) {
            $this->setFlash('error', 'Na skladě není dostatek kusů pro vytvoření objednávky.');
            $this->redirect('/orders/create');
        }

        $now = date('c');
        $totalPrice = (float) $product['price'] * $quantity;

        $orderId = $this->orderRepository->create([
            'order_number' => 'ORD-' . date('Ymd-His') . '-' . random_int(100, 999),
            'customer_name' => $customerName,
            'note' => $note,
            'status' => 'new',
            'total_price' => $totalPrice,
            'created_by_user_id' => (int) $this->authService->currentUser()['id'],
            'created_at' => $now,
            'updated_at' => $now,
        ], [[
            'product_id' => (int) $product['id'],
            'quantity' => $quantity,
            'unit_price' => (float) $product['price'],
        ]]);

        $this->productRepository->changeStock((int) $product['id'], -$quantity);

        $this->setFlash('success', 'Objednávka #' . $orderId . ' byla vytvořena.');
        $this->redirect('/orders');
    }

    public function edit(): void
    {
        $this->requireLogin();

        $orderId = (int) ($_GET['id'] ?? 0);
        $order = $this->orderRepository->find($orderId);

        if (!$order) {
            $this->setFlash('error', 'Objednávka nebyla nalezena.');
            $this->redirect('/orders');
        }

        $this->render('orders/edit', [
            'flash' => $this->getFlash(),
            'order' => $order,
            'items' => $this->orderRepository->itemsForOrder($orderId),
            'orderStatuses' => $this->config['order_statuses'],
        ]);
    }

    public function updateStatus(): void
    {
        $this->requireLogin();

        $orderId = (int) ($_POST['id'] ?? 0);
        $status = $this->input('status');

        if (!array_key_exists($status, $this->config['order_statuses'])) {
            $this->setFlash('error', 'Neplatný stav objednávky.');
            $this->redirect('/orders');
        }

        $this->orderRepository->updateStatus($orderId, $status);
        $this->setFlash('success', 'Stav objednávky byl změněn.');
        $this->redirect('/orders');
    }
}

