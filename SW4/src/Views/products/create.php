<?php require dirname(__DIR__) . '/layout/header.php'; ?>

<div class="card">
    <h1>Nový produkt</h1>
    <form method="post" action="/products/store">
        <label>Název produktu</label>
        <input type="text" name="name" required>

        <label>Kategorie</label>
        <input type="text" name="category" required>

        <label>SKU</label>
        <input type="text" name="sku" required>

        <label>Popis</label>
        <textarea name="description" rows="4" required></textarea>

        <label>Cena</label>
        <input type="number" name="price" min="0" step="0.01" required>

        <label>Počet kusů na skladě</label>
        <input type="number" name="quantity_in_stock" min="0" step="1" required>

        <label>Limit nízkého stavu zásob</label>
        <input type="number" name="low_stock_threshold" min="0" step="1" required>

        <div class="actions">
            <button type="submit">Uložit produkt</button>
            <a href="/products" class="button-link button-secondary">Zpět</a>
        </div>
    </form>
</div>

<?php require dirname(__DIR__) . '/layout/footer.php'; ?>

