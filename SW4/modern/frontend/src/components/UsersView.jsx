export function UsersView({ userForm, users, onChangeUserForm, onSaveUser }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
      <div className="panel">
        {/* Správa uživatelů je samostatná sekce, protože jde o administrativní
            funkci oddělenou od běžné práce se skladem a objednávkami. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Nový uživatel</h2>
        <div className="grid gap-3">
          <label className="section-label">
            Uživatelské jméno
            <input
              className="app-input"
              value={userForm.username}
              onChange={(event) =>
                onChangeUserForm({ ...userForm, username: event.target.value })
              }
            />
          </label>
          <label className="section-label">
            Celé jméno
            <input
              className="app-input"
              value={userForm.full_name}
              onChange={(event) =>
                onChangeUserForm({ ...userForm, full_name: event.target.value })
              }
            />
          </label>
          <label className="section-label">
            Heslo
            <input
              className="app-input"
              type="password"
              value={userForm.password}
              onChange={(event) =>
                onChangeUserForm({ ...userForm, password: event.target.value })
              }
            />
          </label>
          <label className="section-label">
            Role
            <select
              className="app-input"
              value={userForm.role}
              onChange={(event) => onChangeUserForm({ ...userForm, role: event.target.value })}
            >
              <option value="worker">Skladník</option>
              <option value="admin">Správce</option>
            </select>
          </label>
          <button className="app-button" onClick={onSaveUser}>Vytvořit uživatele</button>
        </div>
      </div>

      <div className="panel">
        {/* Výpis účtů je jednoduchý, ale dobře demonstruje práci s rolemi. */}
        <h2 className="mb-4 text-2xl font-bold text-stone-900">Existující uživatelé</h2>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Username</th>
                <th>Jméno</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.full_name}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
