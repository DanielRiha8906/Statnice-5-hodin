<?php

declare(strict_types=1);

namespace Warehouse\Controllers;

use PDOException;
use Warehouse\Core\Controller;

/**
 * Správa uživatelů a rolí.
 */
class UserController extends Controller
{
    public function index(): void
    {
        $this->requireAdmin();

        $this->render('users/index', [
            'flash' => $this->getFlash(),
            'users' => $this->userRepository->all(),
            'roles' => $this->config['roles'],
        ]);
    }

    public function create(): void
    {
        $this->requireAdmin();

        $this->render('users/create', [
            'flash' => $this->getFlash(),
            'roles' => $this->config['roles'],
        ]);
    }

    public function store(): void
    {
        $this->requireAdmin();

        $username = $this->input('username');
        $password = $this->input('password');
        $fullName = $this->input('full_name');
        $role = $this->input('role');

        if ($username === '' || $password === '' || $fullName === '' || $role === '') {
            $this->setFlash('error', 'Všechna pole uživatele musí být vyplněna.');
            $this->redirect('/users/create');
        }

        if (!array_key_exists($role, $this->config['roles'])) {
            $this->setFlash('error', 'Neplatná role uživatele.');
            $this->redirect('/users/create');
        }

        try {
            $this->userRepository->create([
                'username' => $username,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                'full_name' => $fullName,
                'role' => $role,
                'created_at' => date('c'),
            ]);
        } catch (PDOException) {
            $this->setFlash('error', 'Uživatele se nepodařilo uložit. Jméno může být obsazené.');
            $this->redirect('/users/create');
        }

        $this->setFlash('success', 'Uživatel byl vytvořen.');
        $this->redirect('/users');
    }
}

