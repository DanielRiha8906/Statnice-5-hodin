<?php

declare(strict_types=1);

namespace Warehouse\Repositories;

use Warehouse\Core\Database;

/**
 * Repozitář pro uživatele a role.
 */
class UserRepository
{
    public function __construct(private readonly Database $database)
    {
    }

    /**
     * @return array<string, mixed>|false
     */
    public function findByUsername(string $username): array|false
    {
        $statement = $this->database->getConnection()->prepare(
            'SELECT * FROM users WHERE username = :username LIMIT 1'
        );
        $statement->execute(['username' => $username]);

        return $statement->fetch();
    }

    /**
     * @return array<string, mixed>|false
     */
    public function findById(int $id): array|false
    {
        $statement = $this->database->getConnection()->prepare(
            'SELECT * FROM users WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);

        return $statement->fetch();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function all(): array
    {
        return $this->database->getConnection()
            ->query('SELECT * FROM users ORDER BY created_at DESC')
            ->fetchAll();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): void
    {
        $statement = $this->database->getConnection()->prepare(
            'INSERT INTO users (username, password_hash, full_name, role, created_at)
             VALUES (:username, :password_hash, :full_name, :role, :created_at)'
        );

        $statement->execute($data);
    }
}

