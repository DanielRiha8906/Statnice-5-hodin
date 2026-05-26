<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <h1>Nová objednávka</h1>
    <form method="post" action="/orders/store">
        <label>Jméno zákazníka</label>
        <input type="text" name="customer_name" required>

        <label>Produkt</label>
        <select name="product_id" required>
            <option value="">Vyber produkt</option>
            <?php foreach ($products as $product): ?>
                <option value="<?= (int) $product['id'] ?>">
                    <?= htmlspecialchars((string) $product['name']) ?> | SKU <?= htmlspecialchars((string) $product['sku']) ?> | skladem <?= htmlspecialchars((string) $product['quantity_in_stock']) ?>
                </option>
            <?php endforeach; ?>
        </select>

        <label>Množství</label>
        <input type="number" name="quantity" min="1" step="1" required>

        <label>Poznámka</label>
        <textarea name="note" rows="4"></textarea>

        <div class="actions">
            <button type="submit">Vytvořit objednávku</button>
            <a href="/orders" class="button-link button-secondary">Zpět</a>
        </div>
    </form>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

