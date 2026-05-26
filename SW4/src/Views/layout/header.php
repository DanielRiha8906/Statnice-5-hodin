<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($appName) ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f1ea;
            color: #2a2826;
            margin: 0;
        }
        .topbar {
            background: #2e5b4f;
            color: #fff;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .topbar a {
            color: #fff;
            text-decoration: none;
            margin-right: 16px;
            font-weight: bold;
        }
        .container {
            max-width: 1160px;
            margin: 0 auto;
            padding: 24px;
        }
        .card {
            background: #fff;
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border-bottom: 1px solid #ddd;
            padding: 10px 8px;
            text-align: left;
            vertical-align: top;
        }
        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
        }
        .badge-danger { background: #f8d7da; color: #842029; }
        .badge-success { background: #d1e7dd; color: #0f5132; }
        .badge-warning { background: #fff3cd; color: #664d03; }
        .alert {
            padding: 14px 16px;
            border-radius: 12px;
            margin-bottom: 16px;
        }
        .alert-success { background: #d1e7dd; color: #0f5132; }
        .alert-error { background: #f8d7da; color: #842029; }
        .actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        input, select, textarea, button {
            width: 100%;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #c8c5c0;
            box-sizing: border-box;
            margin-top: 6px;
            margin-bottom: 14px;
        }
        button, .button-link {
            background: #2e5b4f;
            color: white;
            border: none;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            padding: 10px 14px;
            border-radius: 10px;
            width: auto;
        }
        .button-secondary {
            background: #7a6f66;
        }
        .button-danger {
            background: #a53b3b;
        }
        .nav-links {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
        }
        .inline-form {
            display: inline;
        }
        .muted {
            color: #6e675f;
        }
    </style>
</head>
<body>
<?php if ($currentUser !== null): ?>
    <div class="topbar">
        <div class="nav-links">
            <a href="/">Dashboard</a>
            <a href="/products">Produkty</a>
            <a href="/orders">Objednávky</a>
            <?php if ($currentUser['role'] === 'admin'): ?>
                <a href="/users">Uživatelé</a>
            <?php endif; ?>
        </div>
        <div class="nav-links">
            <span style="margin-right: 16px;">
                Přihlášen: <?= htmlspecialchars((string) $currentUser['full_name']) ?>
                (<?= htmlspecialchars((string) $currentUser['role']) ?>)
            </span>
            <form method="post" action="/logout" class="inline-form">
                <button type="submit" class="button-secondary">Odhlásit</button>
            </form>
        </div>
    </div>
<?php endif; ?>
<div class="container">
<?php if (!empty($flash)): ?>
    <div class="alert alert-<?= htmlspecialchars((string) $flash['type']) ?>">
        <?= htmlspecialchars((string) $flash['message']) ?>
    </div>
<?php endif; ?>

