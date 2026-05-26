<?php

declare(strict_types=1);

namespace Warehouse\Controllers;

use PDOException;
use Warehouse\Core\Controller;

/**
 * CRUD operace nad produkty.
 */
class ProductController extends Controller
{
    public function index(): void
    {
        $this->requireLogin();

        $this->render('products/index', [
            'flash' => $this->getFlash(),
            'products' => $this->productRepository->all(),
        ]);
    }

    public function create(): void
    {
        $this->requireLogin();

        $this->render('products/create', [
            'flash' => $this->getFlash(),
        ]);
    }

    public function store(): void
    {
        $this->requireLogin();

        $name = $this->input('name');
        $category = $this->input('category');
        $sku = $this->input('sku');
        $description = $this->input('description');
        $price = $this->input('price');
        $quantityInStock = $this->input('quantity_in_stock');
        $lowStockThreshold = $this->input('low_stock_threshold');

        if (
            $name === '' || $category === '' || $sku === '' || $description === '' ||
            $price === '' || $quantityInStock === '' || $lowStockThreshold === ''
        ) {
            $this->setFlash('error', 'Všechna pole produktu musí být vyplněna.');
            $this->redirect('/products/create');
        }

        try {
            $now = date('c');
            $this->productRepository->create([
                'name' => $name,
                'category' => $category,
                'sku' => $sku,
                'description' => $description,
                'price' => (float) $price,
                'quantity_in_stock' => (int) $quantityInStock,
                'low_stock_threshold' => (int) $lowStockThreshold,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } catch (PDOException) {
            $this->setFlash('error', 'Produkt se nepodařilo uložit. Zkontroluj jedinečnost SKU.');
            $this->redirect('/products/create');
        }

        $this->setFlash('success', 'Produkt byl úspěšně vytvořen.');
        $this->redirect('/products');
    }

    public function edit(): void
    {
        $this->requireLogin();

        $productId = (int) ($_GET['id'] ?? 0);
        $product = $this->productRepository->find($productId);

        if (!$product) {
            $this->setFlash('error', 'Produkt nebyl nalezen.');
            $this->redirect('/products');
        }

        $this->render('products/edit', [
            'flash' => $this->getFlash(),
            'product' => $product,
        ]);
    }

    public function update(): void
    {
        $this->requireLogin();

        $productId = (int) ($_POST['id'] ?? 0);
        $product = $this->productRepository->find($productId);

        if (!$product) {
            $this->setFlash('error', 'Produkt nebyl nalezen.');
            $this->redirect('/products');
        }

        try {
            $this->productRepository->update($productId, [
                'name' => $this->input('name'),
                'category' => $this->input('category'),
                'sku' => $this->input('sku'),
                'description' => $this->input('description'),
                'price' => (float) $this->input('price'),
                'quantity_in_stock' => (int) $this->input('quantity_in_stock'),
                'low_stock_threshold' => (int) $this->input('low_stock_threshold'),
                'updated_at' => date('c'),
            ]);
        } catch (PDOException) {
            $this->setFlash('error', 'Produkt se nepodařilo upravit.');
            $this->redirect('/products/edit?id=' . $productId);
        }

        $this->setFlash('success', 'Produkt byl upraven.');
        $this->redirect('/products');
    }

    public function delete(): void
    {
        $this->requireAdmin();

        $productId = (int) ($_POST['id'] ?? 0);
        $product = $this->productRepository->find($productId);

        if (!$product) {
            $this->setFlash('error', 'Produkt nebyl nalezen.');
            $this->redirect('/products');
        }

        try {
            $this->productRepository->delete($productId);
        } catch (PDOException) {
            $this->setFlash(
                'error',
                'Produkt nelze smazat, protože je navázaný na existující objednávky.'
            );
            $this->redirect('/products');
        }

        $this->setFlash('success', 'Produkt byl smazán.');
        $this->redirect('/products');
    }
}

