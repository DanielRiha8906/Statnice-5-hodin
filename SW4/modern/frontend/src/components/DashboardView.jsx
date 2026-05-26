export function DashboardView({ dashboard }) {
  if (!dashboard) {
    return <div className="panel">Dashboard zatím není načtený.</div>;
  }

  return (
    <div className="grid gap-4">
      {/* Přehledové karty dávají uživateli okamžitou orientaci
          v tom, kolik je produktů, objednávek a rizikových zásob. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Produktů" value={dashboard.product_count} />
        <MetricCard label="Objednávek" value={dashboard.order_count} />
        <MetricCard label="Nízký stav zásob" value={dashboard.low_stock_count} />
        <MetricCard
          label="Hodnota zásob"
          value={`${dashboard.total_stock_value.toFixed(2)} Kč`}
        />
      </div>

      <div className="panel overflow-x-auto">
        {/* Low-stock sekce přímo navazuje na jeden z hlavních požadavků zadání. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Low-stock upozornění</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>Produkt</th>
              <th>SKU</th>
              <th>Na skladě</th>
              <th>Limit</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.low_stock_products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.quantity_in_stock}</td>
                <td>{product.low_stock_threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel overflow-x-auto">
        {/* Poslední objednávky slouží jako provozní přehled pro obsluhu skladu. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Poslední objednávky</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>Číslo</th>
              <th>Zákazník</th>
              <th>Stav</th>
              <th>Cena</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.recent_orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>{order.customer_name}</td>
                <td>{order.status}</td>
                <td>{order.total_price.toFixed(2)} Kč</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="panel min-h-[140px]">
      <p className="mb-2 text-4xl font-bold text-stone-900">{value}</p>
      <p className="text-stone-500">{label}</p>
    </div>
  );
}
