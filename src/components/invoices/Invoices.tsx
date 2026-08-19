import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { getInvoices } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { formatDate, onCopy } from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
import AddInvoice from "./AddInvoice";
import InvoiceCreated from "./InvoiceCreated";
import { downloadInvoicePdf } from "./downloadInvoicePdf";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openAdd, setOpenAdd] = useState<string>("");
  const [editInvoice, setEditInvoice] = useState<Invoices | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [viewer, setViewer] = useState(false);
  const [menu, setMenu] = useState<{ row: Invoices; x: number; y: number } | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const authBody = localStorageService.decodeAuthBody();
    if (authBody?.roles === "ex_user_viewer") setViewer(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params: FilterType = {
      pageSize: PER,
      pageNumber: page + 1,
      field: "createdAt",
      sort: "DESC",
    };
    if (debouncedSearch) params.search = debouncedSearch;
    const [res] = await ApiHandler(() => getInvoices(params));
    if (res?.success && res.body) {
      const body = res.body as unknown as { data: Invoices[]; pagination?: Pagination };
      setRows(body.data ?? []);
      setTotal(body.pagination?.totalItems ?? (body.data?.length ?? 0));
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => { void load(); }, [load, refreshFlag]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = search.trim();
      setDebouncedSearch(next);
      setPage(0);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const openMenu = (e: MouseEvent<HTMLElement>, row: Invoices) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    setMenu((cur) => (cur?.row.id === row.id ? null : { row, x: r.right, y: r.bottom + 6 }));
  };

  const onDownload = async (row: Invoices) => {
    setMenu(null);
    setDownloading(true);
    try {
      await downloadInvoicePdf(row);
    } catch {
      mwToast("Could not download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PER));

  const handleInvoiceCreated = (value: string) => {
    const wasEdit = Boolean(editInvoice);
    setEditInvoice(null);
    if (value === "success") {
      setRefreshFlag((f) => !f);
      setOpenAdd(wasEdit ? "" : "success");
    } else {
      setOpenAdd("");
    }
  };

  const onEdit = (row: Invoices) => {
    const status = (row.EcomTransaction?.status ?? row.status ?? "").toUpperCase();
    if (status === "COMPLETED") {
      mwToast("Paid invoices cannot be edited");
      setMenu(null);
      return;
    }
    setMenu(null);
    setEditInvoice(row);
    setOpenAdd("edit");
  };

  const exportCsv = () => {
    if (!rows.length) return mwToast("Nothing to export");
    const head = ["ID", "Date", "Name", "Email", "Requested", "Currency", "Invoiced", "Asset", "Paid", "Status", "Invoice URL"];
    const lines = rows.map((r) => [
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
              <button className="btn btn-primary" onClick={() => { setEditInvoice(null); setOpenAdd("addNew"); }}>
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
                ) : rows.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: "center", padding: 32 }} className="mut">No invoices found</td></tr>
                ) : rows.map((r) => {
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
                      <td>
                        <button
                          type="button"
                          className="kebab"
                          aria-label="Invoice actions"
                          onClick={(e) => openMenu(e, r)}
                        >
                          <IcKebab />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pager />}
        </div>
      </section>

      {menu && (
        <div
          className="kebab-menu"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" disabled={downloading} onClick={() => void onDownload(menu.row)}>
            Download
          </button>
          {!viewer && (
            <button type="button" onClick={() => onEdit(menu.row)}>
              Edit
            </button>
          )}
          <button
            type="button"
            disabled={!menu.row.invoiceURL}
            onClick={() => {
              if (menu.row.invoiceURL) onCopy(menu.row.invoiceURL);
              setMenu(null);
            }}
          >
            Copy link
          </button>
          <button
            type="button"
            disabled={!menu.row.invoiceURL}
            onClick={() => {
              if (menu.row.invoiceURL) window.open(menu.row.invoiceURL, "_blank", "noopener");
              setMenu(null);
            }}
          >
            Open invoice
          </button>
        </div>
      )}

      {(openAdd === "addNew" || openAdd === "edit") && (
        <AddInvoice
          onClose={handleInvoiceCreated}
          openAdd={openAdd}
          invoice={editInvoice ?? undefined}
          setInvoiceUpdated={() => setRefreshFlag((f) => !f)}
        />
      )}
      {openAdd === "success" && <InvoiceCreated onClose={() => setOpenAdd("")} openAdd={openAdd} />}
    </div>
  );
};

export default Invoices;
