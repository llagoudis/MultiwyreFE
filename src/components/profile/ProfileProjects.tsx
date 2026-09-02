"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCustomerMerchant,
  getAllCustomerMerchants,
} from "~/service/api/accounts";
import localStorageService from "~/service/LocalstorageService";
import mwToast from "~/components/mw/toast";

type MerchantRow = {
  projectId: number;
  projectName: string;
};

const ProfileProjects = () => {
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [webURL, setWebURL] = useState("");
  const [callbackURL, setCallbackURL] = useState("");
  const isViewer =
    localStorageService.decodeAuthBody()?.roles === "ex_user_viewer";

  const loadMerchants = useCallback(async () => {
    setLoading(true);
    const [response] = await getAllCustomerMerchants();
    setMerchants((response?.body as MerchantRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadMerchants();
  }, [loadMerchants]);

  const onCreate = async () => {
    if (isViewer) {
      mwToast("You do not have permission to create projects");
      return;
    }
    if (!projectName.trim()) {
      mwToast("Project name is required");
      return;
    }

    setCreating(true);
    const [response, error] = await createCustomerMerchant({
      projectName: projectName.trim(),
      ...(webURL.trim() ? { webURL: webURL.trim() } : {}),
      ...(callbackURL.trim() ? { callbackURL: callbackURL.trim() } : {}),
    });
    setCreating(false);

    if (error) {
      mwToast(error);
      return;
    }
    if (response?.success) {
      mwToast(response.message ?? "Project created");
      setProjectName("");
      setWebURL("");
      setCallbackURL("");
      setShowAdvanced(false);
      void loadMerchants();
    }
  };

  return (
    <div className="ppane">
      <section className="card psec">
        <div className="psec-head">
          <p className="pt">Projects</p>
        </div>
        <p className="ps" style={{ marginBottom: 16 }}>
          Invoices require a project. Create one here, then select it when
          creating an invoice.
        </p>

        {loading ? (
          <p className="ps">Loading projects…</p>
        ) : merchants.length ? (
          <div className="tbl-wrap" style={{ border: "1px solid var(--line-2)", borderRadius: 12 }}>
            <table className="tbl" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Project name</th>
                  <th style={{ width: 100 }}>ID</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.projectId}>
                    <td>{m.projectName}</td>
                    <td>{m.projectId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ps" style={{ color: "#c2410c" }}>
            No projects yet. Create your first project below to start issuing
            invoices.
          </p>
        )}
      </section>

      {!isViewer && (
        <section className="card psec" style={{ marginTop: 16 }}>
          <div className="psec-head">
            <p className="pt">Create project</p>
          </div>
          <div className="fld" style={{ marginTop: 12 }}>
            <label htmlFor="projectName">Project name</label>
            <input
              id="projectName"
              className="inp"
              placeholder="e.g. Default, Website, Store"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 8 }}
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide" : "Show"} optional URL settings
          </button>
          {showAdvanced && (
            <div className="fld-grid" style={{ marginTop: 12 }}>
              <div className="fld">
                <label htmlFor="webURL">Website URL</label>
                <input
                  id="webURL"
                  className="inp"
                  placeholder="https://www.example.com"
                  value={webURL}
                  onChange={(e) => setWebURL(e.target.value)}
                />
              </div>
              <div className="fld">
                <label htmlFor="callbackURL">Callback URL</label>
                <input
                  id="callbackURL"
                  className="inp"
                  placeholder="https://www.example.com/callback"
                  value={callbackURL}
                  onChange={(e) => setCallbackURL(e.target.value)}
                />
              </div>
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={creating}
              onClick={() => void onCreate()}
            >
              {creating ? "Creating…" : "Create project"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfileProjects;
