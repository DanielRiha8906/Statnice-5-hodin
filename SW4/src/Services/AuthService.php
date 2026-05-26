<?php

declare(strict_types=1);

namespace Warehouse\Services;

use Warehouse\Core\Database;
use Warehouse\Repositories\UserRepository;

/**
 * Řeší přihlášení, odhlášení a kontrolu rolí.
 */
class AuthService
{
    private UserRepository $userRepository;

    public function __construct(Database $database)
    {
        $this->userRepository = new UserRepository($database);
    }

    public function attemptLogin(string $username, string $password): bool
    {
        $user = $this->userRepository->findByUsername($username);

        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            return false;
        }

        $_SESSION['user_id'] = (int) $user['id'];
        return true;
    }

    public function logout(): void
    {
        unset($_SESSION['user_id']);
    }

    public function isLoggedIn(): bool
    {
        return isset($_SESSION['user_id']);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function currentUser(): ?array
    {
        $userId = $_SESSION['user_id'] ?? null;

        if ($userId === null) {
            return null;
        }

        $user = $this->userRepository->findById((int) $userId);
        return $user ?: null;
    }

    public function hasRole(string $role): bool
    {
        $user = $this->currentUser();
        return $user !== null && $user['role'] === $role;
    }
}

