<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <h1>Úprava produktu</h1>
    <form method="post" action="/products/update">
        <input type="hidden" name="id" value="<?= (int) $product['id'] ?>">

        <label>Název produktu</label>
        <input type="text" name="name" value="<?= htmlspecialchars((string) $product['name']) ?>" required>

        <label>Kategorie</label>
        <input type="text" name="category" value="<?= htmlspecialchars((string) $product['category']) ?>" required>

        <label>SKU</label>
        <input type="text" name="sku" value="<?= htmlspecialchars((string) $product['sku']) ?>" required>

        <label>Popis</label>
        <textarea name="description" rows="4" required><?= htmlspecialchars((string) $product['description']) ?></textarea>

        <label>Cena</label>
        <input type="number" name="price" min="0" step="0.01" value="<?= htmlspecialchars((string) $product['price']) ?>" required>

        <label>Počet kusů na skladě</label>
        <input type="number" name="quantity_in_stock" min="0" step="1" value="<?= htmlspecialchars((string) $product['quantity_in_stock']) ?>" required>

        <label>Limit nízkého stavu zásob</label>
        <input type="number" name="low_stock_threshold" min="0" step="1" value="<?= htmlspecialchars((string) $product['low_stock_threshold']) ?>" required>

        <div class="actions">
            <button type="submit">Uložit změny</button>
            <a href="/products" class="button-link button-secondary">Zpět</a>
        </div>
    </form>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

