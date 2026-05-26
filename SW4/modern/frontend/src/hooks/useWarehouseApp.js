import { useEffect, useState } from "react";
import { api } from "../services/api";

const STORAGE_KEY = "warehouse-modern-auth";

// Výchozí hodnoty formulářů držíme jako konstanty mimo komponentu/hook.
// Díky tomu je můžeme jednoduše znovu použít při resetu formuláře.
const EMPTY_PRODUCT_FORM = {
  name: "",
  category: "",
  sku: "",
  description: "",
  price: 0,
  quantity_in_stock: 0,
  low_stock_threshold: 0
};

const EMPTY_ORDER_FORM = {
  customer_name: "",
  note: "",
  product_id: "",
  quantity: 1
};

const EMPTY_USER_FORM = {
  username: "",
  full_name: "",
  password: "",
  role: "worker"
};

export function useWarehouseApp() {
  // Hook funguje jako centrální "view model" celé aplikace.
  // Udržuje stav přihlášení, načtených dat i lokálních formulářů.
  const [auth, setAuth] = useState(() => {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [orderForm, setOrderForm] = useState(EMPTY_ORDER_FORM);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);

  useEffect(() => {
    // Jakmile máme token, načteme všechna data potřebná pro dashboard a taby.
    // Tím se odděluje proces přihlášení od následné synchronizace aplikace.
    if (!auth?.token) {
      return;
    }

    void refreshAllData();
  }, [auth?.token]);

  async function login(username, password) {
    // Před novým požadavkem čistíme staré zprávy, aby uživatel neviděl
    // zastaralou chybu nebo úspěch z předchozí operace.
    setError("");
    setInfo("");
    setIsLoading(true);

    try {
      const response = await api.login({ username, password });
      const nextAuth = {
        token: response.token,
        user: response.user
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
      setInfo("Přihlášení proběhlo úspěšně.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    // Při odhlášení mažeme i lokálně uložený token, aby po refreshi stránky
    // aplikace uživatele automaticky znovu nepovažovala za přihlášeného.
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
    setDashboard(null);
    setProducts([]);
    setOrders([]);
    setUsers([]);
    setError("");
    setInfo("Byl jsi odhlášen.");
  }

  async function refreshAllData() {
    if (!auth?.token) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Dashboard, produkty a objednávky jsou nezávislé dotazy, proto je
      // stahujeme paralelně pomocí Promise.all.
      const [dashboardData, productsData, ordersData] = await Promise.all([
        api.fetchDashboard(auth.token),
        api.fetchProducts(auth.token),
        api.fetchOrders(auth.token)
      ]);

      setDashboard(dashboardData);
      setProducts(productsData);
      setOrders(ordersData);

      if (auth.user.role === "admin") {
        // Seznam uživatelů dává smysl načítat jen administrátorovi.
        // Je to menší zátěž pro API i přehlednější návrh oprávnění.
        const usersData = await api.fetchUsers(auth.token);
        setUsers(usersData);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveProduct() {
    if (!auth?.token) {
      return;
    }

    setError("");
    setInfo("");

    try {
      // Jedním formulářem obsluhujeme vytvoření i editaci produktu.
      // Rozhodnutí děláme podle toho, zda je nastavené editingProductId.
      if (editingProductId) {
        await api.updateProduct(auth.token, editingProductId, normalizeProductForm(productForm));
        setInfo("Produkt byl upraven.");
      } else {
        await api.createProduct(auth.token, normalizeProductForm(productForm));
        setInfo("Produkt byl vytvořen.");
      }

      setProductForm(EMPTY_PRODUCT_FORM);
      setEditingProductId(null);
      await refreshAllData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function startEditingProduct(product) {
    // Po kliknutí na "Upravit" předvyplníme formulář daty z tabulky.
    // Uživatel tak pracuje ve stejném formuláři jako při vytváření produktu.
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      sku: product.sku,
      description: product.description,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
      low_stock_threshold: product.low_stock_threshold
    });
    setActiveTab("products");
  }

  function clearEditingProduct() {
    // Návrat z editace do režimu "nový produkt".
    setEditingProductId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
  }

  async function removeProduct(productId) {
    if (!auth?.token) {
      return;
    }

    try {
      await api.deleteProduct(auth.token, productId);
      setInfo("Produkt byl smazán.");
      await refreshAllData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveOrder() {
    if (!auth?.token) {
      return;
    }

    try {
      // Backend očekává pole položek, i když v aktuálním UI zakládáme
      // objednávku jen s jedním produktem. Frontend je tím pádem připravený
      // i na budoucí rozšíření o více položek.
      await api.createOrder(auth.token, {
        customer_name: orderForm.customer_name,
        note: orderForm.note,
        items: [
          {
            product_id: Number(orderForm.product_id),
            quantity: Number(orderForm.quantity)
          }
        ]
      });
      setInfo("Objednávka byla vytvořena.");
      setOrderForm(EMPTY_ORDER_FORM);
      await refreshAllData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeOrderStatus(orderId, status) {
    if (!auth?.token) {
      return;
    }

    try {
      // Změna stavu je samostatná operace nad již existující objednávkou.
      await api.updateOrderStatus(auth.token, orderId, status);
      setInfo("Stav objednávky byl změněn.");
      await refreshAllData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveUser() {
    if (!auth?.token) {
      return;
    }

    try {
      // Tato operace je v UI dostupná jen adminovi, ale backend ji stejně
      // znovu chrání. To je dobrý příklad dvouvrstvé kontroly oprávnění.
      await api.createUser(auth.token, userForm);
      setInfo("Uživatel byl vytvořen.");
      setUserForm(EMPTY_USER_FORM);
      await refreshAllData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return {
    activeTab,
    auth,
    dashboard,
    editingProductId,
    error,
    info,
    isLoading,
    orderForm,
    orders,
    productForm,
    products,
    userForm,
    users,
    changeOrderStatus,
    login,
    logout,
    refreshAllData,
    removeProduct,
    saveOrder,
    saveProduct,
    saveUser,
    clearEditingProduct,
    setActiveTab,
    setOrderForm,
    setProductForm,
    setUserForm,
    startEditingProduct
  };
}

function normalizeProductForm(productForm) {
  // Hodnoty z inputů přicházejí jako stringy. Před odesláním na backend je
  // převádíme na čísla, aby payload odpovídal API kontraktu.
  return {
    ...productForm,
    price: Number(productForm.price),
    quantity_in_stock: Number(productForm.quantity_in_stock),
    low_stock_threshold: Number(productForm.low_stock_threshold)
  };
}
