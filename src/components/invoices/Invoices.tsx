import { useCallback, useEffect, useMemo, useState } from "react";
import { getInvoices } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { formatDate, onCopy } from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
import AddInvoice from "./AddInvoice";
import InvoiceCreated from "./InvoiceCreated";
import { IcSearch, IcKebab } from "~/components/mw/icons";
import mwToast from "~/components/mw/toast";

const PER = 10;

const statusClass = (s = "") => {
  const up = s.toUpperCase();
  if (up === "COMPLETED") return "completed";
  if (up === "FAILED") return "failed";
  return "pending2";
};
const statusLabel = (s = "") => {
  const up = s.toUpperCase();
  if (up === "COMPLETED") return "Completed";
  if (up === "FAILED") return "Failed";
  return "Pending";
};

const Invoices = () => {
  const [rows, setRows] = useState<Invoices[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState<string>("");
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [viewer, setViewer] = useState(false);

  useEffect(() => {
    const authBody = localStorageService.decodeAuthBody();
    if (authBody?.roles === "ex_user_viewer") setViewer(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [res] = await ApiHandler(() =>
      getInvoices({ pageSize: PER, pageNumber: page + 1, field: "createdAt", sort: "DESC" } as FilterType),
    );
    if (res?.success && res.body) {
      const body = res.body as unknown as { data: Invoices[]; pagination?: Pagination };
      setRows(body.data ?? []);
      setTotal(body.pagination?.totalItems ?? (body.data?.length ?? 0));
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { void load(); }, [load, refreshFlag]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      [r.name, r.EcomTransaction?.customerEmail, String(r.id), r.currency].some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(total / PER));

  const handleInvoiceCreated = (value: string) => {
    if (value === "success") { setRefreshFlag((f) => !f); setOpenAdd("success"); }
    else setOpenAdd("");
  };

  const exportCsv = () => {
    if (!filtered.length) return mwToast("Nothing to export");
    const head = ["ID", "Date", "Name", "Email", "Requested", "Currency", "Invoiced", "Asset", "Paid", "Status", "Invoice URL"];
    const lines = filtered.map((r) => [
      r.id, formatDate(r.createdAt), r.name, r.EcomTransaction?.customerEmail ?? "",
      r.amount, r.currency, r.EcomTransaction?.exactAmount ?? "", r.EcomTransaction?.assetId ?? "",
      r.EcomTransaction?.amount ?? "", statusLabel(r.EcomTransaction?.status ?? r.status), r.invoiceURL,
    ].map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "invoices.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const Pager = () => {
    const btns = [];
    for (let i = 0; i < totalPages; i++) btns.push(
      <button key={i} className={`pg${i === page ? " on" : ""}`} onClick={() => setPage(i)}>{i + 1}</button>,
    );
    return (
      <div className="pager">
        <button className="pg" disabled={page === 0} onClick={() => setPage(0)}>«</button>
        <button className="pg" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>‹</button>
        {btns}
        <button className="pg" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>›</button>
        <button className="pg" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
      </div>
    );
  };

  return (
    <div className="view" id="viewInvoice">
      <section className="card pane">
        <div className="pane-head">
          <h1>Invoices</h1>
          <div className="pane-tools">
            <div className="search">
              <IcSearch />
              <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {!viewer && (
              <button className="btn btn-primary" onClick={() => setOpenAdd("addNew")}>
                <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> New Invoices
              </button>
            )}
          </div>
        </div>
        <div className="pane-body">
          <div className="grid-toolbar">
            <div className="gt-left" />
            <div className="gt-right">
              <button className="gt" onClick={exportCsv}>Export</button>
              <button className="gt" onClick={() => { setSearch(""); setPage(0); }}>Clear</button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>
                <th>ID</th><th>Date</th><th>Name</th><th>Email</th><th>Description</th>
                <th>Requested</th><th>Invoiced</th><th>Paid</th><th>Status</th><th>Invoice URL</th><th>Action</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} style={{ textAlign: "center", padding: 32 }} className="mut">Loading invoices…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: "center", padding: 32 }} className="mut">No invoices found</td></tr>
                ) : filtered.map((r) => {
                  const [d, ...rest] = formatDate(r.createdAt).split(" ");
                  const et = r.EcomTransaction;
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.id}</td>
                      <td><div className="mut">{d}</div><div className="sm">{rest.join(" ")}</div></td>
                      <td>{r.name}</td>
                      <td className="mut">{et?.customerEmail ?? "-"}</td>
                      <td className="mut">
                        {et?.billingItems?.length
                          ? et.billingItems.map((b, i) => <div key={i}>{b.description} ({r.currency} {b.amount})</div>)
                          : (r.description ?? "-")}
                      </td>
                      <td>{r.amount} <span className="sm">({r.currency})</span></td>
                      <td>{et?.exactAmount ?? "-"}<div className="sm">({et?.assetId ?? "-"})</div></td>
                      <td>{statusLabel(et?.status ?? r.status) === "Completed" && et?.amount ? <>{et.amount}<div className="sm">({et.assetId})</div></> : "-"}</td>
                      <td><span className={`pill ${statusClass(et?.status ?? r.status)}`}>{statusLabel(et?.status ?? r.status)}</span></td>
                      <td>{r.invoiceURL ? <span className="lnk" onClick={() => onCopy(r.invoiceURL)}>Link Url</span> : "-"}</td>
                      <td><div className="kebab" title="Open invoice" onClick={() => r.invoiceURL && window.open(r.invoiceURL, "_blank", "noopener")}><IcKebab /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pager />}
        </div>
      </section>

      {openAdd === "addNew" && (
        <AddInvoice onClose={handleInvoiceCreated} openAdd={openAdd} setInvoiceUpdated={() => setRefreshFlag((f) => !f)} />
      )}
      {openAdd === "success" && <InvoiceCreated onClose={() => setOpenAdd("")} openAdd={openAdd} />}
    </div>
  );
};

export default Invoices;
