<?php

declare(strict_types=1);

namespace Warehouse\Core;

use Warehouse\Repositories\OrderRepository;
use Warehouse\Repositories\ProductRepository;
use Warehouse\Repositories\UserRepository;
use Warehouse\Services\AuthService;

/**
 * Společný základ pro všechny kontrolery.
 */
abstract class Controller
{
    protected AuthService $authService;
    protected ProductRepository $productRepository;
    protected OrderRepository $orderRepository;
    protected UserRepository $userRepository;

    /**
     * @param array<string, mixed> $config
     */
    public function __construct(
        protected Database $database,
        protected array $config
    ) {
        $this->authService = new AuthService($database);
        $this->productRepository = new ProductRepository($database);
        $this->orderRepository = new OrderRepository($database);
        $this->userRepository = new UserRepository($database);
    }

    /**
     * Vyrenderuje šablonu a předá jí data.
     *
     * @param array<string, mixed> $data
     */
    protected function render(string $view, array $data = []): void
    {
        extract($data);

        $currentUser = $this->authService->currentUser();
        $appName = $this->config['app_name'];

        require dirname(__DIR__) . '/Views/' . $view . '.php';
    }

    protected function redirect(string $path): never
    {
        header('Location: ' . $path);
        exit;
    }

    protected function requireLogin(): void
    {
        if (!$this->authService->isLoggedIn()) {
            $this->redirect('/login');
        }
    }

    protected function requireAdmin(): void
    {
        $this->requireLogin();

        if (!$this->authService->hasRole('admin')) {
            http_response_code(403);
            echo '403 - Přístup pouze pro správce.';
            exit;
        }
    }

    protected function setFlash(string $type, string $message): void
    {
        $_SESSION['flash'] = [
            'type' => $type,
            'message' => $message,
        ];
    }

    /**
     * @return array{type: string, message: string}|null
     */
    protected function getFlash(): ?array
    {
        $flash = $_SESSION['flash'] ?? null;
        unset($_SESSION['flash']);

        return $flash;
    }

    protected function input(string $key, string $default = ''): string
    {
        return trim($_POST[$key] ?? $default);
    }
}

