const EMPTY_PRODUCT_FORM = {
  name: "",
  category: "",
  sku: "",
  description: "",
  price: 0,
  quantity_in_stock: 0,
  low_stock_threshold: 0
};

export function ProductsView({
  auth,
  editingProductId,
  productForm,
  products,
  onChangeForm,
  onClearEditing,
  onDeleteProduct,
  onEditProduct,
  onSaveProduct
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
      <div className="panel">
        {/* Levý panel je formulář. Používáme ho pro create i update scénář,
            což snižuje duplicitu a zjednodušuje UI. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">{editingProductId ? "Upravit produkt" : "Nový produkt"}</h2>
        <div className="grid gap-3">
          <Field label="Název" value={productForm.name} onChange={(value) => onChangeForm({ ...productForm, name: value })} />
          <Field label="Kategorie" value={productForm.category} onChange={(value) => onChangeForm({ ...productForm, category: value })} />
          <Field label="SKU" value={productForm.sku} onChange={(value) => onChangeForm({ ...productForm, sku: value })} />
          <Field label="Popis" value={productForm.description} onChange={(value) => onChangeForm({ ...productForm, description: value })} textarea />
          <Field label="Cena" type="number" value={productForm.price} onChange={(value) => onChangeForm({ ...productForm, price: value })} />
          <Field label="Kusů na skladě" type="number" value={productForm.quantity_in_stock} onChange={(value) => onChangeForm({ ...productForm, quantity_in_stock: value })} />
          <Field label="Low-stock limit" type="number" value={productForm.low_stock_threshold} onChange={(value) => onChangeForm({ ...productForm, low_stock_threshold: value })} />
          <div className="flex flex-wrap gap-3">
            <button className="app-button" onClick={onSaveProduct}>
              {editingProductId ? "Uložit změny" : "Vytvořit produkt"}
            </button>
            {editingProductId ? (
              <button
                className="app-button-secondary"
                onClick={() => {
                  onClearEditing();
                  onChangeForm(EMPTY_PRODUCT_FORM);
                }}
              >
                Zrušit úpravu
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="panel">
        {/* Pravý panel zobrazuje seznam produktů a navazuje na formulář:
            kliknutí na "Upravit" přenese data vybraného řádku zpět vlevo. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Seznam produktů</h2>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Název</th>
                <th>SKU</th>
                <th>Sklad</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="text-sm text-stone-500">{product.category}</div>
                  </td>
                  <td>{product.sku}</td>
                  <td>
                    {product.quantity_in_stock}
                    {product.is_low_stock ? <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-1 text-xs text-red-900">nízký stav</span> : null}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button className="app-button-secondary" onClick={() => onEditProduct(product)}>
                        Upravit
                      </button>
                      {/* Mazání je omezené jen na admina i na úrovni UI. */}
                      {auth.user.role === "admin" ? (
                        <button className="app-button-danger" onClick={() => onDeleteProduct(product.id)}>
                          Smazat
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, onChange, textarea = false, type = "text", value }) {
  // Malá pomocná komponenta drží jednotný rendering inputů a textarea polí.
  // Je to jednoduchý příklad znovupoužitelnosti i v malé aplikaci.
  return (
    <label className="section-label">
      {label}
      {textarea ? (
        <textarea className="app-input" value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
      ) : (
        <input className="app-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
