<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <h1>Vytvoření uživatele</h1>
    <form method="post" action="/users/store">
        <label>Uživatelské jméno</label>
        <input type="text" name="username" required>

        <label>Celé jméno</label>
        <input type="text" name="full_name" required>

        <label>Heslo</label>
        <input type="password" name="password" required>

        <label>Role</label>
        <select name="role" required>
            <?php foreach ($roles as $roleKey => $roleLabel): ?>
                <option value="<?= htmlspecialchars((string) $roleKey) ?>">
                    <?= htmlspecialchars((string) $roleLabel) ?>
                </option>
            <?php endforeach; ?>
        </select>

        <div class="actions">
            <button type="submit">Uložit uživatele</button>
            <a href="/users" class="button-link button-secondary">Zpět</a>
        </div>
    </form>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

