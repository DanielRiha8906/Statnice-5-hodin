<?php

declare(strict_types=1);

namespace Warehouse\Controllers;

use Warehouse\Core\Controller;

/**
 * Přihlašování a odhlašování.
 */
class AuthController extends Controller
{
    public function showLogin(): void
    {
        if ($this->authService->isLoggedIn()) {
            $this->redirect('/');
        }

        $this->render('auth/login', [
            'flash' => $this->getFlash(),
        ]);
    }

    public function login(): void
    {
        $username = $this->input('username');
        $password = $this->input('password');

        if ($username === '' || $password === '') {
            $this->setFlash('error', 'Uživatelské jméno i heslo jsou povinné.');
            $this->redirect('/login');
        }

        if (!$this->authService->attemptLogin($username, $password)) {
            $this->setFlash('error', 'Neplatné přihlašovací údaje.');
            $this->redirect('/login');
        }

        $this->setFlash('success', 'Přihlášení proběhlo úspěšně.');
        $this->redirect('/');
    }

    public function logout(): void
    {
        $this->authService->logout();
        $this->setFlash('success', 'Byl jste odhlášen.');
        $this->redirect('/login');
    }
}

