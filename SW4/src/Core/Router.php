<?php

declare(strict_types=1);

namespace Warehouse\Core;

/**
 * Minimalistický router.
 *
 * Pro účely školní ukázky není potřeba celý framework. Jednoduchý router
 * výborně ukazuje princip mapování HTTP cest na kontrolery.
 */
class Router
{
    /**
     * @var array<string, array<string, callable>>
     */
    private array $routes = [
        'GET' => [],
        'POST' => [],
    ];

    public function get(string $path, callable $handler): void
    {
        $this->routes['GET'][$path] = $handler;
    }

    public function post(string $path, callable $handler): void
    {
        $this->routes['POST'][$path] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $handler = $this->routes[$method][$path] ?? null;

        if ($handler === null) {
            http_response_code(404);
            echo '404 - Stránka nebyla nalezena.';
            return;
        }

        call_user_func($handler);
    }
}

