import { DashboardView } from "./components/DashboardView";
import { LoginForm } from "./components/LoginForm";
import { OrdersView } from "./components/OrdersView";
import { ProductsView } from "./components/ProductsView";
import { UsersView } from "./components/UsersView";
import { useWarehouseApp } from "./hooks/useWarehouseApp";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Produkty" },
  { id: "orders", label: "Objednávky" },
  { id: "users", label: "Uživatelé", adminOnly: true }
];

export default function App() {
  // Hlavní komponenta je úmyslně tenká. Většinu logiky drží custom hook,
  // zatímco App řeší hlavně kompozici obrazovek a předávání props.
  const app = useWarehouseApp();

  if (!app.auth) {
    return (
      <main className="mx-auto grid min-h-screen max-w-6xl place-items-center px-6 py-6">
        <div className="w-full max-w-xl">
          {app.error ? <div className="message-error">{app.error}</div> : null}
          {app.info ? <div className="message-success">{app.info}</div> : null}
          <LoginForm isLoading={app.isLoading} onLogin={app.login} />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <header className="panel mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#98673f]">Skladový systém</p>
          <h1 className="mt-1 text-4xl font-bold text-stone-900">SkladPro Modern</h1>
          <p className="mt-2 text-stone-500">
            Přihlášen: <strong>{app.auth.user.full_name}</strong> ({app.auth.user.role})
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="app-button-secondary" onClick={app.refreshAllData}>
            Obnovit data
          </button>
          <button className="app-button" onClick={app.logout}>Odhlásit</button>
        </div>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2.5">
        {/* Taby filtrujeme podle role. Tím už na úrovni UI skrýváme akce,
            které nedávají běžnému skladníkovi smysl. */}
        {TABS.filter((tab) => !tab.adminOnly || app.auth.user.role === "admin").map((tab) => (
          <button
            key={tab.id}
            className={
              app.activeTab === tab.id
                ? "rounded-2xl bg-clay-700 px-4 py-3 text-white"
                : "rounded-2xl bg-[#ddd0c0] px-4 py-3 text-stone-800"
            }
            onClick={() => app.setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {app.error ? <div className="message-error">{app.error}</div> : null}
      {app.info ? <div className="message-success">{app.info}</div> : null}

      {/* Renderujeme vždy jen jednu hlavní sekci. Větší aplikace by typicky
          použila router, ale pro tuto ukázku stačí tab-based přepínání. */}
      {app.activeTab === "dashboard" ? <DashboardView dashboard={app.dashboard} /> : null}

      {app.activeTab === "products" ? (
        <ProductsView
          auth={app.auth}
          editingProductId={app.editingProductId}
          productForm={app.productForm}
          products={app.products}
          onChangeForm={app.setProductForm}
          onClearEditing={app.clearEditingProduct}
          onDeleteProduct={app.removeProduct}
          onEditProduct={app.startEditingProduct}
          onSaveProduct={app.saveProduct}
        />
      ) : null}

      {app.activeTab === "orders" ? (
        <OrdersView
          orderForm={app.orderForm}
          orders={app.orders}
          products={app.products}
          onChangeOrderForm={app.setOrderForm}
          onChangeOrderStatus={app.changeOrderStatus}
          onSaveOrder={app.saveOrder}
        />
      ) : null}

      {app.activeTab === "users" && app.auth.user.role === "admin" ? (
        <UsersView
          userForm={app.userForm}
          users={app.users}
          onChangeUserForm={app.setUserForm}
          onSaveUser={app.saveUser}
        />
      ) : null}
    </main>
  );
}
