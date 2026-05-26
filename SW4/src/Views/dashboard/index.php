<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <h1>Dashboard skladu</h1>
    <p class="muted">Ukázkový skladový systém zaměřený na vybavení pro stavebnictví.</p>
</div>

<div class="grid">
    <div class="card">
        <h2><?= htmlspecialchars((string) $productCount) ?></h2>
        <p>Počet produktů</p>
    </div>
    <div class="card">
        <h2><?= htmlspecialchars((string) $orderCount) ?></h2>
        <p>Počet objednávek</p>
    </div>
    <div class="card">
        <h2><?= number_format($totalStockValue, 2, ',', ' ') ?> Kč</h2>
        <p>Celková hodnota zásob</p>
    </div>
    <div class="card">
        <h2><?= htmlspecialchars((string) count($lowStockProducts)) ?></h2>
        <p>Produktů s nízkým stavem</p>
    </div>
</div>

<div class="card">
    <h2>Upozornění na nízký stav zásob</h2>
    <?php if ($lowStockProducts === []): ?>
        <span class="badge badge-success">Všechny zásoby jsou v pořádku</span>
    <?php else: ?>
        <table>
            <thead>
            <tr>
                <th>Produkt</th>
                <th>SKU</th>
                <th>Na skladě</th>
                <th>Limit</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($lowStockProducts as $product): ?>
                <tr>
                    <td><?= htmlspecialchars((string) $product['name']) ?></td>
                    <td><?= htmlspecialchars((string) $product['sku']) ?></td>
                    <td><span class="badge badge-danger"><?= htmlspecialchars((string) $product['quantity_in_stock']) ?></span></td>
                    <td><?= htmlspecialchars((string) $product['low_stock_threshold']) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>

<div class="card">
    <h2>Poslední objednávky</h2>
    <table>
        <thead>
        <tr>
            <th>Číslo objednávky</th>
            <th>Zákazník</th>
            <th>Stav</th>
            <th>Cena</th>
        </tr>
        </thead>
        <tbody>
        <?php foreach ($recentOrders as $order): ?>
            <tr>
                <td><?= htmlspecialchars((string) $order['order_number']) ?></td>
                <td><?= htmlspecialchars((string) $order['customer_name']) ?></td>
                <td><?= htmlspecialchars((string) $orderStatuses[$order['status']] ?? (string) $order['status']) ?></td>
                <td><?= number_format((float) $order['total_price'], 2, ',', ' ') ?> Kč</td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

