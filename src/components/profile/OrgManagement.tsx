import { useMemo, useState } from "react";
import { IcPlus, IcRefresh, IcEdit, IcTrash, IcClose } from "~/components/mw/icons";
import useConfirm from "~/components/mw/useConfirm";
import mwToast from "~/components/mw/toast";

/**
 * Organisation Management (Roles & Users).
 * NOTE: there is currently NO backend for roles / users / permissions in the
 * user API. This tab is a fully-functional in-memory UI built to the design;
 * it must be wired to real endpoints once they exist. Nothing is persisted.
 */
const PERM_GROUPS: [string, string[]][] = [
  ["Accounts & Wallets", ["Add wallet", "Edit wallet"]],
  ["History", ["Export transaction data"]],
  ["Invoices", ["Create invoice", "Download invoice"]],
  ["Organisation", ["Add role", "Add user", "Manage organisation users", "Manage organisation roles"]],
  ["Security", ["Manage profile photo", "Change email address", "Change phone number", "Manage 2FA", "Change password", "Manage identity verification"]],
];

interface Role { name: string; perms: string[] }
interface User { email: string; role: string; joined: [string, string] }

const OrgManagement = ({ ownerEmail }: { ownerEmail: string }) => {
  const { confirm, ConfirmDialog } = useConfirm();
  const [orgTab, setOrgTab] = useState<"roles" | "users">("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([{ email: ownerEmail || "owner@multiwyre.com", role: "Owner", joined: ["—", ""] }]);

  const [drawer, setDrawer] = useState<{ kind: "role" | "user" | null; editIdx: number | null }>({ kind: null, editIdx: null });
  const [roleName, setRoleName] = useState("");
  const [rolePerms, setRolePerms] = useState<Set<string>>(new Set());
  const [userEmail, setUserEmail] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userPw2, setUserPw2] = useState("");
  const [userRoles, setUserRoles] = useState<Set<string>>(new Set());

  const allPerms = useMemo(() => PERM_GROUPS.flatMap((g) => g[1]), []);
  const open = drawer.kind !== null;
  const editing = drawer.editIdx !== null;

  const openRole = (idx?: number) => {
    const r = typeof idx === "number" ? roles[idx] : null;
    setRoleName(r?.name ?? "");
    setRolePerms(new Set(r?.perms ?? []));
    setDrawer({ kind: "role", editIdx: idx ?? null });
  };
  const openUser = (idx?: number) => {
    const u = typeof idx === "number" ? users[idx] : null;
    setUserEmail(u?.email ?? "");
    setUserPw(""); setUserPw2("");
    setUserRoles(new Set(u?.role ? [u.role] : []));
    setDrawer({ kind: "user", editIdx: idx ?? null });
  };
  const close = () => setDrawer({ kind: null, editIdx: null });

  const toggle = (set: Set<string>, key: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    apply(next);
  };

  const submitRole = () => {
    if (!roleName.trim()) return mwToast("Enter a role name");
    const role: Role = { name: roleName.trim(), perms: [...rolePerms] };
    if (editing) setRoles((rs) => rs.map((r, i) => (i === drawer.editIdx ? role : r)));
    else setRoles((rs) => [...rs, role]);
    close();
    mwToast(role.name + (editing ? " role updated" : " role created"));
  };
  const submitUser = () => {
    if (!userEmail.trim()) return mwToast("Enter an email");
    if (!editing) {
      if (!userPw) return mwToast("Enter a password");
      if (userPw !== userPw2) return mwToast("Passwords do not match");
    }
    const roleName0 = [...userRoles][0] ?? "Member";
    if (editing) setUsers((us) => us.map((u, i) => (i === drawer.editIdx ? { ...u, email: userEmail.trim(), role: roleName0 } : u)));
    else setUsers((us) => [...us, { email: userEmail.trim(), role: roleName0, joined: ["—", ""] }]);
    close();
    mwToast(userEmail.trim() + (editing ? " updated" : " invited"));
  };

  const delRole = async (i: number) => {
    if (await confirm(`Delete role "${roles[i]!.name}"?`)) { setRoles((rs) => rs.filter((_, k) => k !== i)); mwToast(roles[i]!.name + " role deleted"); }
  };
  const delUser = async (i: number) => {
    if (await confirm(`Remove user "${users[i]!.email}"?`)) { setUsers((us) => us.filter((_, k) => k !== i)); mwToast(users[i]!.email + " removed"); }
  };

  const NF = (
    <div className="nf"><div className="nf-ph" aria-hidden /><div className="nf-t">Not found</div></div>
  );

  return (
    <section className="card" style={{ padding: "16px 18px", flex: 1, minHeight: 420, display: "flex", flexDirection: "column" }}>
      <div className="org-head">
        <div className="otabs">
          <button className={orgTab === "roles" ? "on" : ""} onClick={() => setOrgTab("roles")}>Roles</button>
          <button className={orgTab === "users" ? "on" : ""} onClick={() => setOrgTab("users")}>Users</button>
        </div>
        <div className="org-actions">
          <button className="icon-sq" title="Refresh" onClick={() => mwToast("Refreshed")}><IcRefresh /></button>
          <button className="btn btn-primary" onClick={() => (orgTab === "roles" ? openRole() : openUser())}>
            <IcPlus width={16} height={16} /><span>{orgTab === "roles" ? "Add role" : "Add user"}</span>
          </button>
        </div>
      </div>

      <div className="org-body">
        {orgTab === "roles" ? (
          roles.length ? (
            <table className="otbl">
              <thead><tr><th>Role</th><th>Permissions</th><th className="r">Actions</th></tr></thead>
              <tbody>
                {roles.map((r, i) => (
                  <tr key={i}>
                    <td><span className="rchip">{r.name}</span></td>
                    <td className="d2">{r.perms.length} permission{r.perms.length === 1 ? "" : "s"}</td>
                    <td className="r"><div className="rowacts">
                      <button className="ra-btn" onClick={() => openRole(i)}><IcEdit width={15} height={15} />Edit</button>
                      <button className="ra-btn danger" onClick={() => delRole(i)}><IcTrash width={15} height={15} />Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : NF
        ) : (
          <table className="otbl">
            <thead><tr><th>User</th><th>Role</th><th>Joined on</th><th className="r">Actions</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td className="d1">{u.email}</td>
                  <td><span className="rchip">{u.role}</span></td>
                  <td><div className="d1">{u.joined[0]}</div><div className="d2">{u.joined[1]}</div></td>
                  <td className="r"><div className="rowacts">
                    <button className="ra-btn" onClick={() => openUser(i)}><IcEdit width={15} height={15} />Edit</button>
                    <button className="ra-btn danger" onClick={() => delUser(i)}><IcTrash width={15} height={15} />Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      <div className={`overlay drawer-ov${open ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
        <aside className="drawer" role="dialog" aria-modal="true">
          <div className="drawer-head">
            <div>
              <h2>{drawer.kind === "role" ? (editing ? "Edit Role" : "Create Role") : editing ? "Edit user" : "Create user"}</h2>
              <p>{drawer.kind === "role" ? (editing ? "Update this role's name and permissions" : "Create a new role with specific permissions") : editing ? "Update this user's roles" : "Create a new user with specific roles"}</p>
            </div>
            <button className="x" aria-label="Close" onClick={close}><IcClose width={17} height={17} /></button>
          </div>

          <div className="drawer-body">
            {drawer.kind === "role" ? (
              <>
                <label className="rn-lbl">Role Name</label>
                <input className="rn-inp" placeholder="Enter role name" autoComplete="off" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                <div className="rf-head"><h4>Role Functionality</h4>
                  <button className="rf-all" onClick={() => setRolePerms(rolePerms.size === allPerms.length ? new Set() : new Set(allPerms))}>{rolePerms.size === allPerms.length ? "Deselect all" : "Select all"}</button>
                </div>
                <div>
                  {PERM_GROUPS.map(([g, items]) => (
                    <div key={g}>
                      <div className="pgroup">{g}</div>
                      {items.map((p) => (
                        <label className="perm" key={p}>
                          <input type="checkbox" checked={rolePerms.has(p)} onChange={() => toggle(rolePerms, p, setRolePerms)} />{p}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            ) : roles.length ? (
              <>
                <label className="rn-lbl">Email</label>
                <input className="rn-inp" placeholder="name@company.com" autoComplete="off" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                {!editing && (
                  <>
                    <label className="rn-lbl" style={{ marginTop: 16 }}>Password</label>
                    <input className="rn-inp" type="password" placeholder="Enter password" autoComplete="new-password" value={userPw} onChange={(e) => setUserPw(e.target.value)} />
                    <label className="rn-lbl" style={{ marginTop: 16 }}>Confirm Password</label>
                    <input className="rn-inp" type="password" placeholder="Re-enter password" autoComplete="new-password" value={userPw2} onChange={(e) => setUserPw2(e.target.value)} />
                  </>
                )}
                <div className="rf-head"><h4>Roles</h4></div>
                <div>
                  {roles.map((r) => (
                    <label className="perm" key={r.name}>
                      <input type="checkbox" checked={userRoles.has(r.name)} onChange={() => toggle(userRoles, r.name, setUserRoles)} />{r.name}
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "22px 0 6px" }}>
                  <div className="nf-ph" aria-hidden /><div style={{ fontSize: 15, fontWeight: 700, color: "#64748b" }}>No roles here</div>
                </div>
                <button className="btn-outline-blue" onClick={() => openRole()}>Add role</button>
              </>
            )}
          </div>

          <div className="drawer-foot">
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={drawer.kind === "user" && roles.length === 0}
              onClick={drawer.kind === "role" ? submitRole : submitUser}
            >
              {drawer.kind === "role" ? (editing ? "Save Role" : "Create Role") : editing ? "Save user" : "Create user"}
            </button>
          </div>
        </aside>
      </div>
      {ConfirmDialog}
    </section>
  );
};

export default OrgManagement;
