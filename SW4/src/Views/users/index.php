<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <div class="actions" style="justify-content: space-between; align-items: center;">
        <div>
            <h1>Uživatelé a role</h1>
            <p class="muted">Správa přístupů do systému pro správce a skladníky.</p>
        </div>
        <a href="/users/create" class="button-link">Nový uživatel</a>
    </div>
</div>

<div class="card">
    <table>
        <thead>
        <tr>
            <th>Uživatelské jméno</th>
            <th>Celé jméno</th>
            <th>Role</th>
            <th>Vytvořeno</th>
        </tr>
        </thead>
        <tbody>
        <?php foreach ($users as $user): ?>
            <tr>
                <td><?= htmlspecialchars((string) $user['username']) ?></td>
                <td><?= htmlspecialchars((string) $user['full_name']) ?></td>
                <td><?= htmlspecialchars((string) ($roles[$user['role']] ?? $user['role'])) ?></td>
                <td><?= htmlspecialchars((string) $user['created_at']) ?></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

