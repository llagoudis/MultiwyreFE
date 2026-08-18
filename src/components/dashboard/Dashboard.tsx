import { useEffect, useMemo, useState } from "react";
import useGlobalStore from "~/store/useGlobalStore";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import { deleteWhitelistAddress, getPaymentActivity, getWhitelistedAddress } from "~/service/api/accounts";
import { coinMeta, networkOf, shortAddr } from "~/components/mw/assets";
import { IcPlus, IcCopy, IcEdit, IcTrash, IcClock, IcLockClosed, IcCard, IcWalletEmpty } from "~/components/mw/icons";
import AddAccountModal from "./AddAccountModal";
import useConfirm from "~/components/mw/useConfirm";
import mwToast from "~/components/mw/toast";

const PERIODS = ["Last 24 hours", "Last 7 Days", "Last 30 Days"] as const;

const fmtMoney = (n: number) => Number(n || 0).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Dashboard = () => {
  const [dashboard, whitelist, syncWhitelist, user] = useGlobalStore((s) => [s.dashboard, s.whitelistedAddress, s.syncWhitelistedAddress, s.user]);
  const assets = useAsyncMasterStore("assets") as Assets[];
  const { confirm, ConfirmDialog } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WhitelistAddress | null>(null);
  const [paKind, setPaKind] = useState<"deposits" | "withdrawals">("deposits");
  const [pa, setPa] = useState<Record<string, number | number[]>>({});

  useEffect(() => {
    void syncWhitelist();
    void (async () => {
      const [res] = await getPaymentActivity();
      if (res?.success && res.body) setPa(res.body as Record<string, number>);
    })();
  }, []);

  const refreshWhitelist = async () => {
    const [res] = await getWhitelistedAddress();
    if (res?.success) useGlobalStore.setState({ whitelistedAddress: res.body, whiteListSynced: true });
  };

  const balanceByAsset = useMemo(() => {
    const m = new Map<string, { balance: string; assetValue: number }>();
    (dashboard.assets ?? []).forEach((a) => m.set(a.assetId, { balance: a.balance, assetValue: a.assetValue }));
    return m;
  }, [dashboard.assets]);

  const currencySym = (dashboard.currency || "EUR") === "EUR" ? "€" : dashboard.currency;
  const accounts = whitelist ?? [];
  const companyName = user.companyProfileDetails?.companyName || user.fullname || "there";

  const copy = (v: string) => {
    if (navigator.clipboard) void navigator.clipboard.writeText(v);
    mwToast("Address copied");
  };

  const onDelete = async (a: WhitelistAddress) => {
    if (await confirm(`Delete account "${a.label}"?`)) {
      const [, err] = await deleteWhitelistAddress(a.id);
      if (err) return mwToast(err);
      await refreshWhitelist();
      mwToast(a.label + " deleted");
    }
  };

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (a: WhitelistAddress) => { setEditTarget(a); setModalOpen(true); };

  return (
    <div className="view" id="viewDashboard">
      <section className="welcome">
        <h2>Welcome, {companyName}</h2>
        <p>Your dashboard is all set and ready for you to explore now.</p>
      </section>

      <section className="card balance">
        <div className="bal-left">
          <div className="bal-eyebrow">
            <span className="chip"><IcCard width={16} height={16} /></span>
            Total Balance
          </div>
          <div className="bal-amount"><span className="cur">{currencySym}</span>{fmtMoney(dashboard.totalValue)}</div>
          <div className="bal-sub">
            {accounts.length ? `Across ${accounts.length} account${accounts.length === 1 ? "" : "s"} in ${dashboard.currency || "EUR"}` : "No accounts added yet"}
          </div>
        </div>
        <div className="bal-actions">
          <button className="btn btn-primary" onClick={openAdd}><IcPlus width={17} height={17} /> Add Wallet</button>
        </div>
      </section>

      <div className="section-head">
        <h3>Accounts</h3>
        <div className="head-right">
          <span className="count">{accounts.length} account{accounts.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      <section className="card acct-list">
        {accounts.length === 0 ? (
          <div className="empty">
            <div className="ic"><IcWalletEmpty width={26} height={26} /></div>
            <h4>No accounts yet</h4>
            <p>Add your first account to start receiving and sending funds. You choose the asset, network and address — Multiwyre never holds your keys.</p>
            <button className="btn btn-primary" style={{ margin: "0 auto" }} onClick={openAdd}><IcPlus width={17} height={17} /> Add Wallet</button>
          </div>
        ) : (
          accounts.map((a) => {
            const cm = coinMeta(a.assetId);
            const net = networkOf(a.assetId);
            const approval = String(a.approvalStatus || (a.status ? "approved" : "pending")).toLowerCase();
            const approved = approval === "approved";
            const rejected = approval === "rejected";
            const statusClass = approved ? "approved" : rejected ? "failed" : "pending";
            const statusLabel = approved ? "Approved" : rejected ? "Rejected" : "Pending";
            const bal = balanceByAsset.get(a.assetId);
            const base = (a.Assets?.name ?? a.assetId);
            return (
              <div className="arow" key={String(a.id)}>
                <div className="coin" style={{ background: cm.color }}>{cm.glyph}</div>
                <div className="meta">
                  <div className="nm">{a.label}{net && <span className="net">{net}</span>}</div>
                  <div className="sub">
                    <span className={`stat ${statusClass}`} title={statusLabel}>
                      {approved ? <>Approved<IcLockClosed width={12} height={12} /></> : rejected ? statusLabel : <><IcClock width={12} height={12} />Pending</>}
                    </span>
                    <span className="addr copy" title="Click to copy" onClick={() => copy(a.assetAddress)}>
                      {shortAddr(a.assetAddress)}<IcCopy width={11} height={11} />
                    </span>
                  </div>
                </div>
                <div className="amt">
                  {bal && Number(bal.balance) > 0 ? (
                    <>
                      <div className="v">{Number(bal.balance).toLocaleString()}</div>
                      <div className="fiat">≈ {currencySym}{fmtMoney(bal.assetValue)}</div>
                    </>
                  ) : (
                    <>
                      <div className="v zero">0</div>
                      <div className="fiat">≈ {currencySym}0.00</div>
                    </>
                  )}
                </div>
                <button className="edit-btn" title="Edit account" aria-label="Edit account" onClick={() => openEdit(a)}><IcEdit width={15} height={15} /></button>
                <button className="del-btn" title="Delete account" aria-label="Delete account" onClick={() => onDelete(a)}><IcTrash width={15} height={15} /></button>
              </div>
            );
          })
        )}
      </section>

      <div className="section-head"><h3>Payment Activity</h3></div>
      <section className="card" style={{ flex: "none" }}>
        <div className="pa-head">
          <div className="seg">
            <button className={paKind === "deposits" ? "on" : ""} onClick={() => setPaKind("deposits")}>Deposits</button>
            <button className={paKind === "withdrawals" ? "on" : ""} onClick={() => setPaKind("withdrawals")}>Withdrawals</button>
          </div>
        </div>
        <div className="pa-grid">
          {PERIODS.map((p, i) => {
            const win = ["24h", "7d", "30d"][i];
            const pre = paKind === "deposits" ? "deposit" : "withdraw";
            const count = Number(pa[`${pre}${win}Count`] ?? 0);
            const amount = Number(pa[`${pre}${win}Amount`] ?? 0);
            const seriesRaw = pa[`${pre}${win}Series`];
            const bars = Array.isArray(seriesRaw)
              ? seriesRaw.map((value) => Number(value) || 0)
              : [];
            const max = Math.max(0, ...bars);
            return (
              <div className="pa-card" key={p}>
                <div className="lbl">{p}</div>
                <div className="amt"><span className="cur">{currencySym}</span>{fmtMoney(amount)}</div>
                <div className="tx"><IcCard width={14} height={14} />{count} Transactions</div>
                <div className="chart">
                  {bars.map((b, j) => (
                    <div key={j} className={`bar${j === bars.length - 1 ? " hi" : ""}`} style={{ height: `${max > 0 ? Math.round((b / max) * 100) : 8}%` }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AddAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        assets={assets}
        tfaEnabled={!!user.tfaEnabled}
        editTarget={editTarget}
        onSubmitted={refreshWhitelist}
      />
      {ConfirmDialog}
    </div>
  );
};

export default Dashboard;
