import { useState } from "react";

export function LoginForm({ isLoading, onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");

  function handleSubmit(event) {
    // Formulář drží login lokálně, protože tato data nejsou potřeba nikde jinde
    // než při samotném pokusu o přihlášení.
    event.preventDefault();
    onLogin(username, password);
  }

  return (
    <div className="panel w-full max-w-[460px]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#98673f]">FastAPI + React</p>
      <h1 className="mt-2 text-4xl font-bold text-stone-900">SkladPro Modern</h1>
      <p className="mt-2 text-stone-500">
        Výchozí účty: <strong>admin/admin123</strong> a <strong>worker/worker123</strong>
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <label className="section-label">
          Uživatelské jméno
          <input className="app-input" value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label className="section-label">
          Heslo
          <input
            className="app-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="app-button mt-2" type="submit" disabled={isLoading}>
          {isLoading ? "Přihlašuji..." : "Přihlásit se"}
        </button>
      </form>
    </div>
  );
}
