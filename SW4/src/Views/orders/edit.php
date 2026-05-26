<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <h1>Detail objednávky</h1>
    <p><strong>Číslo:</strong> <?= htmlspecialchars((string) $order['order_number']) ?></p>
    <p><strong>Zákazník:</strong> <?= htmlspecialchars((string) $order['customer_name']) ?></p>
    <p><strong>Stav:</strong> <?= htmlspecialchars((string) ($orderStatuses[$order['status']] ?? $order['status'])) ?></p>
    <p><strong>Poznámka:</strong> <?= htmlspecialchars((string) $order['note']) ?: 'Bez poznámky' ?></p>
    <p><strong>Vytvořil:</strong> <?= htmlspecialchars((string) $order['created_by_name']) ?></p>
    <p><strong>Celková cena:</strong> <?= number_format((float) $order['total_price'], 2, ',', ' ') ?> Kč</p>
</div>

<div class="card">
    <h2>Položky objednávky</h2>
    <table>
        <thead>
        <tr>
            <th>Produkt</th>
            <th>SKU</th>
            <th>Množství</th>
            <th>Cena za kus</th>
        </tr>
        </thead>
        <tbody>
        <?php foreach ($items as $item): ?>
            <tr>
                <td><?= htmlspecialchars((string) $item['product_name']) ?></td>
                <td><?= htmlspecialchars((string) $item['product_sku']) ?></td>
                <td><?= htmlspecialchars((string) $item['quantity']) ?></td>
                <td><?= number_format((float) $item['unit_price'], 2, ',', ' ') ?> Kč</td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>

    <div class="actions" style="margin-top: 16px;">
        <a href="/orders" class="button-link button-secondary">Zpět na objednávky</a>
    </div>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

