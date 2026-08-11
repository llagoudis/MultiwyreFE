import { useEffect, useMemo, useState } from "react";
import { IcPlus, IcRefresh, IcEdit, IcTrash, IcClose } from "~/components/mw/icons";
import useConfirm from "~/components/mw/useConfirm";
import mwToast from "~/components/mw/toast";
import {
  createOrgRole,
  createOrgUser,
  deleteOrgRole,
  deleteOrgUser,
  getOrgPermissions,
  getOrgRoles,
  getOrgUsers,
  updateOrgRole,
  updateOrgUser,
  type OrgRole,
  type OrgUser,
} from "~/service/api/org";

/**
 * Organisation Management (Roles & Users) — wired to /api/v1/org/*
 * Create user also provisions a real USER + COMPANIES_AND_USERS row so they can log in.
 */
const FALLBACK_PERM_GROUPS: [string, string[]][] = [
  ["Accounts & Wallets", ["Add wallet", "Edit wallet"]],
  ["History", ["Export transaction data"]],
  ["Invoices", ["Create invoice", "Download invoice"]],
  ["Organisation", ["Add role", "Add user", "Manage organisation users", "Manage organisation roles"]],
  ["Security", ["Manage profile photo", "Change email address", "Change phone number", "Manage 2FA", "Change password", "Manage identity verification"]],
];

const OrgManagement = ({ ownerEmail }: { ownerEmail: string }) => {
  const { confirm, ConfirmDialog } = useConfirm();
  const [orgTab, setOrgTab] = useState<"roles" | "users">("roles");
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [permGroups, setPermGroups] = useState<[string, string[]][]>(FALLBACK_PERM_GROUPS);
  const [loading, setLoading] = useState(false);

  const [drawer, setDrawer] = useState<{ kind: "role" | "user" | null; editIdx: number | null }>({ kind: null, editIdx: null });
  const [roleName, setRoleName] = useState("");
  const [rolePerms, setRolePerms] = useState<Set<string>>(new Set());
  const [userEmail, setUserEmail] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userPw2, setUserPw2] = useState("");
  const [userRoles, setUserRoles] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const allPerms = useMemo(() => permGroups.flatMap((g) => g[1]), [permGroups]);
  const open = drawer.kind !== null;
  const editing = drawer.editIdx !== null;

  const load = async () => {
    setLoading(true);
    const [[permRes], [roleRes], [userRes]] = await Promise.all([
      getOrgPermissions(),
      getOrgRoles(),
      getOrgUsers(),
    ]);
    if (permRes?.success && Array.isArray(permRes.body)) {
      setPermGroups(permRes.body.map((g) => [g.group, g.perms]));
    }
    if (roleRes?.success && Array.isArray(roleRes.body)) setRoles(roleRes.body);
    if (userRes?.success && Array.isArray(userRes.body)) {
      const list = userRes.body;
      // Keep owner visible even if not in org directory yet
      if (ownerEmail && !list.some((u) => u.email.toLowerCase() === ownerEmail.toLowerCase())) {
        setUsers([{ id: 0, email: ownerEmail, role: "Owner", roleId: null, joined: ["—", ""] }, ...list]);
      } else {
        setUsers(list);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerEmail]);

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
    setUserRoles(new Set(u?.role && u.role !== "Owner" ? [u.role] : []));
    setDrawer({ kind: "user", editIdx: idx ?? null });
  };
  const close = () => setDrawer({ kind: null, editIdx: null });

  const toggle = (set: Set<string>, key: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    apply(next);
  };

  const submitRole = async () => {
    if (!roleName.trim()) return mwToast("Enter a role name");
    const payload = { name: roleName.trim(), perms: [...rolePerms] };
    if (editing) {
      const id = roles[drawer.editIdx!]?.id;
      if (!id) return;
      const [res] = await updateOrgRole(id, payload);
      if (!res?.success) return mwToast("Failed to update role");
    } else {
      const [res] = await createOrgRole(payload);
      if (!res?.success) return mwToast("Failed to create role");
    }
    close();
    mwToast(payload.name + (editing ? " role updated" : " role created"));
    void load();
  };

  const submitUser = async () => {
    if (!userEmail.trim()) return mwToast("Enter an email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) return mwToast("Enter a valid email");
    const roleName0 = [...userRoles][0];
    if (!roleName0) return mwToast("Select a role");
    const roleId = roles.find((r) => r.name === roleName0)?.id ?? null;
    if (!roleId) return mwToast("Select a role");
    setSaving(true);
    try {
      if (editing) {
        const id = users[drawer.editIdx!]?.id;
        if (!id) return mwToast("Owner row cannot be edited here");
        const [res, err] = await updateOrgUser(id, { email: userEmail.trim(), roleId });
        if (!res?.success) return mwToast(err || "Failed to update user");
      } else {
        if (!userPw) return mwToast("Enter a password");
        if (userPw.length < 8) return mwToast("Password must be at least 8 characters");
        if (userPw !== userPw2) return mwToast("Passwords do not match");
        const [res, err] = await createOrgUser({
          email: userEmail.trim(),
          password: userPw,
          roleId,
        });
        if (!res?.success) return mwToast(err || "Failed to create user");
      }
      close();
      mwToast(userEmail.trim() + (editing ? " updated" : " created — they can log in with this email"));
      void load();
    } finally {
      setSaving(false);
    }
  };

  const delRole = async (i: number) => {
    const role = roles[i];
    if (!role) return;
    if (!(await confirm(`Delete role "${role.name}"?`))) return;
    const [res] = await deleteOrgRole(role.id);
    if (!res?.success) return mwToast("Failed to delete role");
    mwToast(role.name + " role deleted");
    void load();
  };

  const delUser = async (i: number) => {
    const user = users[i];
    if (!user?.id) return mwToast("Owner cannot be removed here");
    if (!(await confirm(`Remove user "${user.email}"?`))) return;
    const [res, err] = await deleteOrgUser(user.id);
    if (!res?.success) return mwToast(err || "Failed to remove user");
    mwToast(user.email + " removed");
    void load();
  };

  const NF = (
    <div className="nf"><div className="nf-ph" aria-hidden /><div className="nf-t">{loading ? "Loading…" : "Not found"}</div></div>
  );

  return (
    <section className="card" style={{ padding: "16px 18px", flex: 1, minHeight: 420, display: "flex", flexDirection: "column" }}>
      <div className="org-head">
        <div className="otabs">
          <button className={orgTab === "roles" ? "on" : ""} onClick={() => setOrgTab("roles")}>Roles</button>
          <button className={orgTab === "users" ? "on" : ""} onClick={() => setOrgTab("users")}>Users</button>
        </div>
        <div className="org-actions">
          <button className="icon-sq" title="Refresh" onClick={() => void load()}><IcRefresh /></button>
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
                  <tr key={r.id}>
                    <td><span className="rchip">{r.name}</span></td>
                    <td className="d2">{r.perms.length} permission{r.perms.length === 1 ? "" : "s"}</td>
                    <td className="r"><div className="rowacts">
                      <button className="ra-btn" onClick={() => openRole(i)}><IcEdit width={15} height={15} />Edit</button>
                      <button className="ra-btn danger" onClick={() => void delRole(i)}><IcTrash width={15} height={15} />Delete</button>
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
                <tr key={`${u.id}-${u.email}`}>
                  <td className="d1">{u.email}</td>
                  <td><span className="rchip">{u.role}</span></td>
                  <td><div className="d1">{u.joined[0]}</div><div className="d2">{u.joined[1]}</div></td>
                  <td className="r"><div className="rowacts">
                    {u.id > 0 && (
                      <>
                        <button className="ra-btn" onClick={() => openUser(i)}><IcEdit width={15} height={15} />Edit</button>
                        <button className="ra-btn danger" onClick={() => void delUser(i)}><IcTrash width={15} height={15} />Delete</button>
                      </>
                    )}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                  {permGroups.map(([g, items]) => (
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
                    <input className="rn-inp" type="password" placeholder="Enter password (min 8 characters)" autoComplete="new-password" value={userPw} onChange={(e) => setUserPw(e.target.value)} />
                    <label className="rn-lbl" style={{ marginTop: 16 }}>Confirm Password</label>
                    <input className="rn-inp" type="password" placeholder="Re-enter password" autoComplete="new-password" value={userPw2} onChange={(e) => setUserPw2(e.target.value)} />
                  </>
                )}
                <div className="rf-head"><h4>Roles</h4></div>
                <div>
                  {roles.map((r) => (
                    <label className="perm" key={r.id}>
                      <input
                        type="checkbox"
                        checked={userRoles.has(r.name)}
                        onChange={() => {
                          // Single role selection (matches current UX)
                          setUserRoles(new Set([r.name]));
                        }}
                      />
                      {r.name}
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
              disabled={saving || (drawer.kind === "user" && roles.length === 0)}
              onClick={() => void (drawer.kind === "role" ? submitRole() : submitUser())}
            >
              {saving
                ? "Saving…"
                : drawer.kind === "role"
                  ? (editing ? "Save Role" : "Create Role")
                  : editing
                    ? "Save user"
                    : "Create user"}
            </button>
          </div>
        </aside>
      </div>
      {ConfirmDialog}
    </section>
  );
};

export default OrgManagement;
