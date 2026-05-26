<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card" style="max-width: 420px; margin: 60px auto;">
    <h1>Přihlášení do systému</h1>
    <p class="muted">Výchozí účet: <strong>admin</strong> / <strong>admin123</strong></p>

    <form method="post" action="/login">
        <label>Uživatelské jméno</label>
        <input type="text" name="username" required>

        <label>Heslo</label>
        <input type="password" name="password" required>

        <button type="submit">Přihlásit se</button>
    </form>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

