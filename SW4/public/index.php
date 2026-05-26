<?php

declare(strict_types=1);

/**
 * Hlavní vstupní bod aplikace.
 *
 * Jedná se o jednoduchý "front controller". Všechny HTTP požadavky jdou přes
 * tento soubor, který:
 * - načte konfiguraci,
 * - inicializuje databázi,
 * - zaregistruje trasy,
 * - a předá řízení routeru.
 */

session_start();

spl_autoload_register(static function (string $className): void {
    $prefix = 'Warehouse\\';
    $baseDirectory = dirname(__DIR__) . '/src/';

    if (!str_starts_with($className, $prefix)) {
        return;
    }

    $relativeClass = substr($className, strlen($prefix));
    $filePath = $baseDirectory . str_replace('\\', '/', $relativeClass) . '.php';

    if (is_file($filePath)) {
        require_once $filePath;
    }
});

$config = require dirname(__DIR__) . '/config/config.php';

use Warehouse\Controllers\ApiController;
use Warehouse\Controllers\AuthController;
use Warehouse\Controllers\DashboardController;
use Warehouse\Controllers\OrderController;
use Warehouse\Controllers\ProductController;
use Warehouse\Controllers\UserController;
use Warehouse\Core\Database;
use Warehouse\Core\Router;

$database = new Database($config['database']);
$database->migrate();
$database->seedDefaultData();

$router = new Router();

$authController = new AuthController($database, $config);
$dashboardController = new DashboardController($database, $config);
$productController = new ProductController($database, $config);
$orderController = new OrderController($database, $config);
$userController = new UserController($database, $config);
$apiController = new ApiController($database, $config);

$router->get('/', [$dashboardController, 'index']);

$router->get('/login', [$authController, 'showLogin']);
$router->post('/login', [$authController, 'login']);
$router->post('/logout', [$authController, 'logout']);

$router->get('/products', [$productController, 'index']);
$router->get('/products/create', [$productController, 'create']);
$router->post('/products/store', [$productController, 'store']);
$router->get('/products/edit', [$productController, 'edit']);
$router->post('/products/update', [$productController, 'update']);
$router->post('/products/delete', [$productController, 'delete']);

$router->get('/orders', [$orderController, 'index']);
$router->get('/orders/create', [$orderController, 'create']);
$router->post('/orders/store', [$orderController, 'store']);
$router->get('/orders/edit', [$orderController, 'edit']);
$router->post('/orders/update-status', [$orderController, 'updateStatus']);

$router->get('/users', [$userController, 'index']);
$router->get('/users/create', [$userController, 'create']);
$router->post('/users/store', [$userController, 'store']);

$router->get('/api/products', [$apiController, 'products']);
$router->get('/api/orders', [$apiController, 'orders']);
$router->get('/api/stock-alerts', [$apiController, 'stockAlerts']);

$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');

