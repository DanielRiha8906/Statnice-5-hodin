const ORDER_STATUSES = ["new", "processing", "completed", "cancelled"];

export function OrdersView({
  orderForm,
  orders,
  products,
  onChangeOrderForm,
  onChangeOrderStatus,
  onSaveOrder
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
      <div className="panel">
        {/* Formulář vytváří objednávku nad jedním vybraným produktem.
            Datový model backendu ale podporuje i více položek. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Nová objednávka</h2>
        <div className="grid gap-3">
          <label className="section-label">
            Zákazník
            <input
              className="app-input"
              value={orderForm.customer_name}
              onChange={(event) =>
                onChangeOrderForm({ ...orderForm, customer_name: event.target.value })
              }
            />
          </label>
          <label className="section-label">
            Produkt
            <select
              className="app-input"
              value={orderForm.product_id}
              onChange={(event) =>
                onChangeOrderForm({ ...orderForm, product_id: event.target.value })
              }
            >
              <option value="">Vyber produkt</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} | skladem {product.quantity_in_stock}
                </option>
              ))}
            </select>
          </label>
          <label className="section-label">
            Množství
            <input
              className="app-input"
              type="number"
              min="1"
              value={orderForm.quantity}
              onChange={(event) =>
                onChangeOrderForm({ ...orderForm, quantity: event.target.value })
              }
            />
          </label>
          <label className="section-label">
            Poznámka
            <textarea
              className="app-input"
              rows={4}
              value={orderForm.note}
              onChange={(event) => onChangeOrderForm({ ...orderForm, note: event.target.value })}
            />
          </label>
          <button className="app-button" onClick={onSaveOrder}>Vytvořit objednávku</button>
        </div>
      </div>

      <div className="panel">
        {/* Přehled objednávek zároveň dovoluje měnit jejich stav,
            takže uživatel nemusí přecházet na jinou obrazovku. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Objednávky</h2>
        {orders.map((order) => (
          <div key={order.id} className="mb-3 rounded-[18px] border border-[#eadfce] bg-sand-50 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row">
              <div>
                <strong>{order.order_number}</strong>
                <div className="text-sm text-stone-500">{order.customer_name}</div>
              </div>
              <div>
                <select
                  className="app-input min-w-44"
                  value={order.status}
                  onChange={(event) => onChangeOrderStatus(order.id, event.target.value)}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2 text-sm text-stone-500">Vytvořil: {order.created_by_name}</div>
            <div className="text-sm text-stone-500">Cena: {order.total_price.toFixed(2)} Kč</div>
            <ul className="mt-3 list-disc pl-5 text-sm text-stone-800">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product_name} | {item.quantity} ks | {item.unit_price.toFixed(2)} Kč
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
