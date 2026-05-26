<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <div class="actions" style="justify-content: space-between; align-items: center;">
        <div>
            <h1>Objednávky</h1>
            <p class="muted">Evidence objednávek, jejich stavů a vydaných skladových položek.</p>
        </div>
        <a href="/orders/create" class="button-link">Nová objednávka</a>
    </div>
</div>

<?php foreach ($orders as $order): ?>
    <div class="card">
        <div class="actions" style="justify-content: space-between; align-items: flex-start;">
            <div>
                <h2><?= htmlspecialchars((string) $order['order_number']) ?></h2>
                <p><strong>Zákazník:</strong> <?= htmlspecialchars((string) $order['customer_name']) ?></p>
                <p><strong>Vytvořil:</strong> <?= htmlspecialchars((string) $order['created_by_name']) ?></p>
                <p><strong>Poznámka:</strong> <?= htmlspecialchars((string) $order['note']) ?: 'Bez poznámky' ?></p>
                <p><strong>Celkem:</strong> <?= number_format((float) $order['total_price'], 2, ',', ' ') ?> Kč</p>
            </div>
            <div>
                <form method="post" action="/orders/update-status">
                    <input type="hidden" name="id" value="<?= (int) $order['id'] ?>">
                    <label>Stav objednávky</label>
                    <select name="status">
                        <?php foreach ($orderStatuses as $statusKey => $statusLabel): ?>
                            <option value="<?= htmlspecialchars((string) $statusKey) ?>" <?= $order['status'] === $statusKey ? 'selected' : '' ?>>
                                <?= htmlspecialchars((string) $statusLabel) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <button type="submit">Uložit stav</button>
                </form>
                <a href="/orders/edit?id=<?= (int) $order['id'] ?>" class="button-link button-secondary">Detail objednávky</a>
            </div>
        </div>

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
            <?php foreach ($order['items'] as $item): ?>
                <tr>
                    <td><?= htmlspecialchars((string) $item['product_name']) ?></td>
                    <td><?= htmlspecialchars((string) $item['product_sku']) ?></td>
                    <td><?= htmlspecialchars((string) $item['quantity']) ?></td>
                    <td><?= number_format((float) $item['unit_price'], 2, ',', ' ') ?> Kč</td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endforeach; ?>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

