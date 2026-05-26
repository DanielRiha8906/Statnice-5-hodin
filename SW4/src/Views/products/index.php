<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <div class="actions" style="justify-content: space-between; align-items: center;">
        <div>
            <h1>Produkty</h1>
            <p class="muted">Přehled skladových položek, jejich ceny a aktuálního stavu zásob.</p>
        </div>
        <a href="/products/create" class="button-link">Přidat produkt</a>
    </div>
</div>

<div class="card">
    <table>
        <thead>
        <tr>
            <th>Název</th>
            <th>Kategorie</th>
            <th>SKU</th>
            <th>Cena</th>
            <th>Sklad</th>
            <th>Upozornění</th>
            <th>Akce</th>
        </tr>
        </thead>
        <tbody>
        <?php foreach ($products as $product): ?>
            <tr>
                <td>
                    <strong><?= htmlspecialchars((string) $product['name']) ?></strong><br>
                    <span class="muted"><?= htmlspecialchars((string) $product['description']) ?></span>
                </td>
                <td><?= htmlspecialchars((string) $product['category']) ?></td>
                <td><?= htmlspecialchars((string) $product['sku']) ?></td>
                <td><?= number_format((float) $product['price'], 2, ',', ' ') ?> Kč</td>
                <td><?= htmlspecialchars((string) $product['quantity_in_stock']) ?></td>
                <td>
                    <?php if ((int) $product['is_low_stock'] === 1): ?>
                        <span class="badge badge-danger">Nízký stav</span>
                    <?php else: ?>
                        <span class="badge badge-success">V pořádku</span>
                    <?php endif; ?>
                </td>
                <td>
                    <div class="actions">
                        <a href="/products/edit?id=<?= (int) $product['id'] ?>" class="button-link button-secondary">Upravit</a>
                        <?php if ($currentUser['role'] === 'admin'): ?>
                            <form method="post" action="/products/delete" class="inline-form" onsubmit="return confirm('Opravdu smazat produkt?');">
                                <input type="hidden" name="id" value="<?= (int) $product['id'] ?>">
                                <button type="submit" class="button-danger">Smazat</button>
                            </form>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

