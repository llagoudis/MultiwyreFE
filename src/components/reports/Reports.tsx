import { useCallback, useEffect, useMemo, useState } from "react";
import useGlobalStore from "~/store/useGlobalStore";
import { getEcomTransactions, getExchangeTxns } from "~/service/api/transaction";
import { ApiHandler } from "~/service/UtilService";
import { bigNumber, formatAddress, formatDate, onCopy } from "~/helpers/helper";
import mwToast from "~/components/mw/toast";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Tab = 1 | 2; // 1 = Trading, 2 = Processing

const tradeStatus = (s = "") => {
  const up = s.toUpperCase();
  if (up === "COMPLETED" || up === "CONFIRMED") return ["completed", "Executed"];
  if (up === "PENDING") return ["pending2", "Pending"];
  return ["failed", "Failed"];
};
const procBadge = (s = "") => {
  const up = s.toUpperCase();
  if (up === "COMPLETED" || up === "CONFIRMED") return "b-ok";
  if (up === "PENDING") return "b-pend";
  return "b-fail";
};

const Reports = () => {
  const dashboard = useGlobalStore((s) => s.dashboard);
  const [tab, setTab] = useState<Tab>(2);
  const [showFilters, setShowFilters] = useState(true);
  const [currency, setCurrency] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [trade, setTrade] = useState<any[]>([]);
  const [proc, setProc] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const currencyOptions = useMemo(() => {
    const seen = new Set<string>();
    return (dashboard.assets ?? []).filter((a) => (seen.has(a.assetId) ? false : seen.add(a.assetId)));
  }, [dashboard.assets]);

  const load = useCallback(async () => {
    setLoading(true);
    const params: FilterType = { pageSize: 50, pageNumber: 1 } as FilterType;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (currency) params.assetName = currency;
    if (tab === 1) {
      const [res] = await ApiHandler<{ data: any[]; pagination: Pagination }>(getExchangeTxns, params);
      if (res?.success && res.body?.data) setTrade(res.body.data);
      else setTrade([]);
    } else {
      const [res] = await ApiHandler<{ data: any[]; pagination: Pagination }>(getEcomTransactions, params);
      if (res?.success && res.body?.data) setProc(res.body.data);
      else setProc([]);
    }
    setLoading(false);
  }, [tab, currency, fromDate, toDate]);

  useEffect(() => { void load(); }, [load]);

  const resetFilters = () => { setCurrency(""); setFromDate(""); setToDate(""); };

  const wallet = (row: any) => {
    const name = row?.SourceAsset?.Asset?.name ?? row?.Asset?.name ?? row?.assetId ?? "-";
    const fromA = row?.fromAddress;
    const toA = row?.EcomTransaction?.toAddress ?? row?.toAddress;
    return (
      <div className="wal">
        <div className="wal-ic">{String(name).charAt(0)}</div>
        <div>
          <div className="wal-n">{name}</div>
          <div className="wal-a">
            <span className="k">From:</span><span className="v">{formatAddress(fromA) || "--"}</span>
            <span className="k">To:</span><span className="v">{formatAddress(toA) || "--"}</span>
          </div>
        </div>
      </div>
    );
  };

  const tradeCols = ["Date and Time", "Sender Account", "Receiver Account", "Transaction ID", "Amount", "Exchange fee", "Transaction fee", "Net Amount", "Status"];
  const procCols = ["Date and Time", "Client ID", "Customer E-mail", "Merchant Name", "Unique ID", "Order ID", "Status", "Requested Amount", "Fee", "Received Amount", "Transaction Type", "Wallet", "Transaction ID"];

  const downloadCsv = () => {
    const rows = tab === 1 ? trade : proc;
    if (!rows.length) return mwToast("Nothing to download");
    const cols = tab === 1 ? tradeCols : procCols;
    const cell = (r: any, c: string): string => {
      if (tab === 1) {
        switch (c) {
          case "Date and Time": return formatDate(r.createdAt);
          case "Sender Account": return `${r?.SourceAsset?.Asset?.name ?? ""} ${r?.sourceAddress ?? ""}`;
          case "Receiver Account": return `${r?.DestinationAsset?.Asset?.name ?? ""} ${(r?.operationType === 2 && r?.assetId === "EUR" ? r?.EuroTransaction?.IBAN : r?.destinationAddress) ?? ""}`;
          case "Transaction ID": return r?.transactionId ?? "";
          case "Amount": return `${bigNumber(r?.TransactionFee?.amount)} ${r?.assetId ?? ""}`;
          case "Exchange fee": return `${bigNumber(r?.TransactionFee?.exchangeFee)} ${r?.TransactionFee?.exchangeFeeCurrency ?? ""}`;
          case "Transaction fee": return `${bigNumber(r?.TransactionFee?.transactionFee)} ${r?.TransactionFee?.transactionFeeCurrency ?? ""}`;
          case "Net Amount": return `${bigNumber(r?.TransactionFee?.creditedAmount)} ${r?.destinationAssetId ?? ""}`;
          case "Status": return tradeStatus(r?.status)[1]!;
          default: return "";
        }
      }
      switch (c) {
        case "Date and Time": return formatDate(r.createdAt);
        case "Client ID": return r?.customerId ?? "";
        case "Customer E-mail": return r?.customerEmail || r?.recoveryEmail || "";
        case "Merchant Name": return "";
        case "Unique ID": return r?.widgetNumber ?? "";
        case "Order ID": return r?.orderId ?? "";
        case "Status": return r?.status ?? "";
        case "Requested Amount": return `${r?.requestedAmount ?? ""} ${r?.requestedAssetId ?? ""}`;
        case "Fee": return r?.networkFee ?? "";
        case "Received Amount": return r?.OperationType?.id === 2 ? "---" : (r?.exactAmount ?? "");
        case "Transaction Type": return r?.OperationType?.id === 2 ? "Outgoing Transfer" : r?.OperationType?.id === 1 ? "Incoming Transfer" : "Internal Transfer";
        case "Wallet": return `${r?.SourceAsset?.Asset?.name ?? ""} ${r?.fromAddress ?? ""}`;
        case "Transaction ID": return r?.transactionId ?? "";
        default: return "";
      }
    };
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => `"${cell(r, c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = (tab === 1 ? "trading-history" : "processing-history") + ".csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="view" id="viewHistory">
      <section className="card filters">
        <div className="filters-head">
          <div className="fh-left">
            <div className="fh-ic">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15.29 0.01H2.21C0.99 0.01 0 1 0 2.22c0 .53.19 1.04.53 1.44L5.7 9.69c.19.23.3.52.3.81v5.64c0 .61.31 1.17.83 1.49.28.17.6.26.92.26.27 0 .53-.06.78-.19l2-1c.6-.3.97-.9.97-1.57v-4.64c0-.3.11-.59.3-.81l5.17-6.03c.34-.4.53-.91.53-1.44C17.5.99 16.51 0 15.29 0z" fill="#DB33A1" /></svg>
            </div>
            <div>
              <p className="fh-t">Filters</p>
              <p className="fh-s">Refine your transactions history</p>
            </div>
          </div>
          <button className="btn-pink" onClick={() => setShowFilters((v) => !v)}>{showFilters ? "Hide" : "View"} Filters <span style={{ fontSize: 11 }}>✕</span></button>
        </div>
        {showFilters && (
          <div className="filters-row">
            <div className="ffld"><p>Currency</p>
              <select className="finp" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="">All</option>
                {currencyOptions.map((a) => <option key={a.assetId} value={a.assetId}>{a.name}</option>)}
              </select>
            </div>
            <div className="ffld"><p>Start date</p><input type="date" className="finp" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
            <div className="ffld"><p>End date</p><input type="date" className="finp" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
            <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => void load()}>Apply Filters</button>
            <button type="button" className="btn-pink" style={{ justifyContent: "center" }} onClick={resetFilters}>↻ Reset Filters</button>
          </div>
        )}
      </section>

      <section className="card pane" style={{ marginTop: 12 }}>
        <div className="pane-body">
          <div className="hist-title">Recent activity</div>
          <div className="hist-head">
            <div className="htabs">
              <button className={tab === 1 ? "on" : ""} onClick={() => setTab(1)}>Trading History</button>
              <button className={tab === 2 ? "on" : ""} onClick={() => setTab(2)}>Processing History</button>
            </div>
            <div className="gt-right">
              <button className="gt" onClick={downloadCsv}>⭳ Download</button>
              <button className="gt" onClick={() => mwToast("Column display — coming soon")}>▤ Display</button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>{(tab === 1 ? tradeCols : procCols).map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={13} style={{ textAlign: "center", padding: 32 }} className="mut">Loading…</td></tr>
                ) : tab === 1 ? (
                  trade.length === 0 ? <tr><td colSpan={9} style={{ textAlign: "center", padding: 32 }} className="mut">No trading history</td></tr> :
                  trade.map((r, i) => {
                    const [cls, label] = tradeStatus(r?.status);
                    const receiver = r?.operationType === 2 && r?.assetId === "EUR" ? r?.EuroTransaction?.IBAN : r?.destinationAddress;
                    return (
                      <tr key={i}>
                        <td>{formatDate(r?.createdAt)}</td>
                        <td>{r?.SourceAsset?.Asset?.name ?? "-"}<div className="sm">{formatAddress(r?.sourceAddress)}</div></td>
                        <td>{r?.DestinationAsset?.Asset?.name ?? "-"}<div className="sm">{formatAddress(receiver)}</div></td>
                        <td className="lnk" onClick={() => r?.transactionId && onCopy(r.transactionId)}>{formatAddress(r?.transactionId)}</td>
                        <td>{bigNumber(r?.TransactionFee?.amount)} <span className="sm">{r?.assetId}</span></td>
                        <td>{bigNumber(r?.TransactionFee?.exchangeFee)} <span className="sm">{r?.TransactionFee?.exchangeFeeCurrency}</span></td>
                        <td>{bigNumber(r?.TransactionFee?.transactionFee)} <span className="sm">{r?.TransactionFee?.transactionFeeCurrency}</span></td>
                        <td>{bigNumber(r?.TransactionFee?.creditedAmount)} <span className="sm">{r?.destinationAssetId}</span></td>
                        <td><span className={`pill ${cls}`}>{label}</span></td>
                      </tr>
                    );
                  })
                ) : (
                  proc.length === 0 ? <tr><td colSpan={13} style={{ textAlign: "center", padding: 32 }} className="mut">No processing history</td></tr> :
                  proc.map((r, i) => (
                    <tr key={i}>
                      <td>{formatDate(r?.createdAt)}</td>
                      <td>{r?.customerId ?? "-"}</td>
                      <td className="mut">{r?.customerEmail || r?.recoveryEmail || "-"}</td>
                      <td className="mut">-</td>
                      <td>{r?.widgetNumber ?? "-"}</td>
                      <td>{r?.orderId ?? "-"}</td>
                      <td><span className={`badge ${procBadge(r?.status)}`}>{r?.status ?? "-"}</span></td>
                      <td>{r?.requestedAmount ?? "-"} <span className="sm">{r?.requestedAssetId}</span></td>
                      <td>{r?.networkFee ? parseFloat(r.networkFee).toFixed(6) : "-"}</td>
                      <td><b>{r?.OperationType?.id === 2 ? "---" : (r?.exactAmount ?? "-")}</b></td>
                      <td>{r?.OperationType?.id === 2 ? "Outgoing Transfer" : r?.OperationType?.id === 1 ? "Incoming Transfer" : "Internal Transfer"}</td>
                      <td>{wallet(r)}</td>
                      <td className="lnk" onClick={() => r?.transactionId && onCopy(r.transactionId)}>{formatAddress(r?.transactionId)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
