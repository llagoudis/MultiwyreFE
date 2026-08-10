import { useEffect, useMemo, useRef, useState } from "react";
import useGlobalStore from "~/store/useGlobalStore";
import { changeName, coinForKrakenName, coinName, dateValidation } from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import {
  createExchangeTransaction,
  fetchTransaferFeesApi,
  getFxMarkup,
  SendEuroMail,
} from "~/service/ApiRequests";
import { verify2FAOTP } from "~/service/api/auth";
import Modal from "~/components/mw/Modal";
import Otp from "~/components/mw/Otp";
import { IcShieldLock, IcInfo } from "~/components/mw/icons";
import mwToast from "~/components/mw/toast";

const pairs = [
  "BTC/USDC", "BTC/EUR", "USDC/EUR", "ETH/EUR", "ETH/USDC", "ETH/BTC",
  "USDC/USDT", "USDT/EUR", "USDC/USDT.t", "USDT.t/EUR", "BTC/USDT.t",
];
const availableCurrencies = ["BTC", "USDC", "EUR", "USDT", "ETH"];

const BENEF_FIELDS = [
  ["iban", "IBAN", true, "GB08 PYYP 0099 3912 0001 49"],
  ["name", "Customer name", true, "Full name"],
  ["addr", "Customer address", true, "Street address"],
  ["zip", "Customer ZIP code", true, "ZIP / postcode"],
  ["dest", "Destination address", false, "Same as IBAN"],
] as const;
const BENEF_BANK = [
  ["swift", "Customer swift", true, "PYYPGB21"],
  ["bank", "Bank name", true, "Bank name"],
  ["bankAddr", "Bank address", true, "Street, city"],
  ["bankLoc", "Bank location", true, "Postcode"],
  ["bankCountry", "Bank country", true, "Country"],
  ["ref", "Bank reference", false, "e.g. Fx Conversion"],
] as const;
type BenefKey = (typeof BENEF_FIELDS)[number][0] | (typeof BENEF_BANK)[number][0];

const ExchangeNew = () => {
  const dashboard = useGlobalStore((s) => s.dashboard);
  const user = useGlobalStore((s) => s.user);

  const assets = useMemo(
    () => dashboard?.assets?.filter((a) => availableCurrencies.includes(coinForKrakenName(a.assetId))) ?? [],
    [dashboard?.assets],
  );

  const [from, setFrom] = useState<string>(coinName("BTC"));
  const [to, setTo] = useState<string>(coinName("USDC"));
  const [volume, setVolume] = useState<string>("");
  const [market, setMarket] = useState<string>("0");
  const [fees, setFees] = useState({ fxMarkUp: 0, exchangePercent: 0, exchangeFixedFee: 0, transactionPercent: 0, transactionFixedFee: 0 });
  const [pairInfo, setPairInfo] = useState<{ pair: string; reversed: boolean; type: string }>({ pair: "", reversed: false, type: "sell" });
  const [menu, setMenu] = useState<"from" | "to" | "">("");
  const [destAddr, setDestAddr] = useState("");
  const [benef, setBenef] = useState<Record<BenefKey, string>>({ iban: "", name: "", addr: "", zip: "", dest: "", swift: "", bank: "", bankAddr: "", bankLoc: "", bankCountry: "", ref: "" });

  const [view, setView] = useState<"form" | "order">("form");
  const [trade, setTrade] = useState<{ vol: string; from: string; to: string; receiveAmt: string; dest: string; depositAddr: string; bankRef: string } | null>(null);
  const [tfaOpen, setTfaOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const fromTicker = coinForKrakenName(from);
  const toTicker = coinForKrakenName(to);
  const isToEur = toTicker === "EUR";
  const isFromEur = fromTicker === "EUR";
  const fromAsset = assets.find((a) => a.assetId === from);
  const toAsset = assets.find((a) => a.assetId === to);
  const balance = Number(fromAsset?.balance ?? 0);

  const feesRef = useRef(fees);
  feesRef.current = fees;

  // ---- fee config ----
  const fetchFees = async (fromT: string, toT: string, toId: string) => {
    const [fxRes] = await getFxMarkup(dashboard.priceList);
    const fxArr: FXMarkup[] = (fxRes?.body ?? []).filter((i) => i?.priceListId === dashboard?.priceList);
    const fx = fxArr.filter(
      (i) => (i?.fromCurrencyId === "ANY" || i?.fromCurrencyId === coinName(fromT)) &&
        (i?.toCurrencyId === "ANY" || i?.toCurrencyId === coinName(toT)) && dateValidation(i) && i.status,
    );
    const fxMarkUp = Number(fx[0]?.percent ?? 0);

    const [tfRes] = await ApiHandler<TransferFees[]>(fetchTransaferFeesApi);
    const ex = tfRes?.body?.find((i) => i?.priceListId === dashboard?.priceList && i?.operationType === 5 && (i?.currencyId === "ANY" || i?.currencyId === toId) && dateValidation(i) && i.status);
    const tx = tfRes?.body?.find((i) => i?.priceListId === dashboard?.priceList && i?.operationType === 7 && (i?.currencyId === "ANY" || i?.currencyId === toId) && dateValidation(i) && i.status);
    setFees({
      fxMarkUp,
      exchangePercent: ex?.percent ?? 0,
      exchangeFixedFee: ex?.fixedFee ?? 0,
      transactionPercent: tx?.percent ?? 0,
      transactionFixedFee: tx?.fixedFee ?? 0,
    });
  };

  // ---- rate (Kraken, marked up) ----
  const fetchMarket = async (pair: string, reversed: boolean) => {
    try {
      const res = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
      const data = await res.json();
      const priceStr = data?.result?.[changeName(pair)]?.a?.[0];
      if (!priceStr) return;
      const price = reversed ? 1 / parseFloat(priceStr) : parseFloat(priceStr);
      const marked = price * (1 + (feesRef.current.fxMarkUp ?? 0) / 100);
      setMarket(marked.toFixed(8));
    } catch { /* transient network error — keep last rate */ }
  };

  useEffect(() => {
    let matching = pairs.find((p) => p === `${fromTicker}/${toTicker}`);
    let reversed = false;
    if (!matching) { matching = pairs.find((p) => p === `${toTicker}/${fromTicker}`); reversed = true; }
    setPairInfo({ pair: matching ?? "", reversed, type: reversed ? "buy" : "sell" });
    if (!matching) { setMarket("0"); return; }
    void fetchFees(reversed ? toTicker : fromTicker, reversed ? fromTicker : toTicker, to);
    void fetchMarket(matching, reversed);
    const iv = setInterval(() => fetchMarket(matching!, reversed), 4000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  // ---- receive + fee breakdown ----
  const vol = parseFloat(volume) || 0;
  const price = parseFloat(market) || 0;
  const grossAmount = vol * price;
  const exchangeFee = grossAmount * (fees.exchangePercent / 100) + fees.exchangeFixedFee;
  const transactionFee = grossAmount * (fees.transactionPercent / 100) + fees.transactionFixedFee;
  const receive = vol > 0 && price > 0 ? Math.max(grossAmount - Math.max(exchangeFee, 0) - Math.max(transactionFee, 0), 0) : 0;

  const selectSide = (side: "from" | "to", assetId: string) => {
    if (side === "from") { if (assetId === to) setTo(from); setFrom(assetId); }
    else { if (assetId === from) setFrom(to); setTo(assetId); }
    setMenu("");
  };
  const swap = () => { const f = from; setFrom(to); setTo(f); };

  const execute = () => {
    if (vol <= 0) return mwToast("Enter an amount");
    let dest = "";
    if (isToEur) {
      if (!benef.iban || !benef.name || !benef.swift || !benef.bank) return mwToast("Fill in the required beneficiary details");
      dest = benef.iban;
    } else {
      dest = destAddr.trim();
      if (!dest) return mwToast("Enter a destination wallet address");
    }
    setTrade({
      vol: String(vol),
      from,
      to,
      receiveAmt: receive.toFixed(6),
      dest,
      depositAddr: fromAsset?.assetAddress || "—",
      bankRef: "FX-" + Math.floor(100000 + Math.random() * 900000),
    });
    setView("order");
  };

  const resetForm = () => {
    setView("form");
    setVolume("");
    setDestAddr("");
    setBenef({ iban: "", name: "", addr: "", zip: "", dest: "", swift: "", bank: "", bankAddr: "", bankLoc: "", bankCountry: "", ref: "" });
    setTrade(null);
  };

  const submitOrder = async () => {
    if (!trade) return;
    setBusy(true);
    const formData = {
      spendingCurrency: from,
      receivingCurrency: to,
      pair: pairInfo.pair,
      ordertype: "market",
      price: market,
      spendingAmount: vol,
      receivingAmount: receive,
      volume: pairInfo.type === "sell" ? vol : receive,
      type: pairInfo.type,
      fxMarkUp: fees.fxMarkUp,
      exchangeFixedFee: fees.exchangeFixedFee,
      exchangePercent: fees.exchangePercent,
      transactionFixedFee: fees.transactionFixedFee,
      transactionPercent: fees.transactionPercent,
      exchangeFee,
      transactionFee,
    };
    const [res, err] = await ApiHandler(createExchangeTransaction, formData);
    if (isToEur && res?.success) {
      // crypto -> EUR: also register the beneficiary payout via the euro endpoint.
      await SendEuroMail({
        IBAN: benef.iban, customerName: benef.name, customerAddress: benef.addr, customerZipcode: benef.zip,
        customerCity: "", customerCountry: benef.bankCountry, swift: benef.swift, bankName: benef.bank,
        bankAddress: benef.bankAddr, bankLocation: benef.bankLoc, bankCountry: benef.bankCountry,
        paymentSystemType: "SEPA", reference: benef.ref || trade.bankRef, amount: receive, currency: "EUR",
        transferFee: transactionFee, description: benef.ref || "FX Conversion",
      } as unknown as EuroMail).catch(() => undefined);
    }
    setBusy(false);
    if (err || !res?.success) return mwToast(err || "Could not submit the order");
    mwToast(res?.message || "Order confirmed — view it in History → Trading History");
    setTfaOpen(false);
    resetForm();
  };

  const onConfirm = () => {
    if (user.tfaEnabled) { setOtp(""); setOtpErr(false); setTfaOpen(true); }
    else void submitOrder();
  };

  const onVerify = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    const [res, err] = await verify2FAOTP(otp);
    setBusy(false);
    if (err || !res?.success) { setOtpErr(true); setOtp(""); return; }
    void submitOrder();
  };

  const CoinDropdown = ({ side }: { side: "from" | "to" }) => {
    const current = side === "from" ? from : to;
    const exclude = side === "from" ? to : from;
    const curAsset = assets.find((a) => a.assetId === current);
    return (
      <div className="exc-fld" style={{ position: "relative" }}>
        <label>{side === "from" ? "From" : "To"}</label>
        <div className="exc-select" onClick={(e) => { e.stopPropagation(); setMenu(menu === side ? "" : side); }}>
          <span className="exc-coin">{coinForKrakenName(current).charAt(0)}</span>
          <span>{curAsset?.name ?? coinForKrakenName(current)}</span>
          <svg className="chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
        <div className={`exc-menu${menu === side ? " open" : ""}`}>
          {assets.filter((a) => a.assetId !== exclude).map((a) => (
            <div key={a.assetId} className={`opt${a.assetId === current ? " on" : ""}`} onClick={(e) => { e.stopPropagation(); selectSide(side, a.assetId); }}>
              <span className="exc-coin">{coinForKrakenName(a.assetId).charAt(0)}</span>{a.name} ({coinForKrakenName(a.assetId)})
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="view" id="viewExchange" onClick={() => setMenu("")}>
      <div className="exwrap">
        {view === "form" && (
          <section className="card exc-card">
            <div className="exc-head">
              <h1>OTC Exchange</h1>
              <p>Exchange at best market price</p>
            </div>
            <div className="exc-body">
              <div className="exc-pair">
                <CoinDropdown side="from" />
                <button className="exc-swap" title="Swap" onClick={swap}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 1L21 5M21 5L17 9M21 5H7" stroke="#606060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 23L3 19M3 19L7 15M3 19H17" stroke="#606060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <CoinDropdown side="to" />
              </div>

              <div className="exc-row2">
                <div className="exc-fld" style={{ flex: 1 }}>
                  <label>Amount<span className="req">*</span></label>
                  <div className="exc-amt">
                    <input type="number" placeholder="Enter Amount" value={volume} onChange={(e) => setVolume(e.target.value)} />
                    <span className="exc-unit">{fromTicker}</span>
                    <button className="exc-max" onClick={() => setVolume(String(balance))}>Max <span>({balance.toFixed(6)} {fromAsset?.name || fromTicker})</span></button>
                  </div>
                </div>
              </div>

              {!isToEur ? (
                <div className="exc-fld">
                  <label>Destination wallet address ({toTicker})<span className="req">*</span></label>
                  <input className="rn-inp" placeholder="Enter the wallet address to receive funds" autoComplete="off" value={destAddr} onChange={(e) => setDestAddr(e.target.value)} />
                </div>
              ) : (
                <div className="exc-benef">
                  <h3>Beneficiary Details</h3>
                  <div className="exc-benef-sec">Customer Information</div>
                  <div className="exc-benef-grid">
                    {BENEF_FIELDS.map(([key, label, req, ph]) => (
                      <div className="exc-benef-row" key={key}>
                        <label>{label}{req && <span className="req">*</span>}</label>
                        <input className="rn-inp" placeholder={ph} autoComplete="off" value={benef[key]} onChange={(e) => setBenef((b) => ({ ...b, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <div className="exc-benef-sec">Banking information</div>
                  <div className="exc-benef-grid">
                    {BENEF_BANK.map(([key, label, req, ph]) => (
                      <div className="exc-benef-row" key={key}>
                        <label>{label}{req && <span className="req">*</span>}</label>
                        <input className="rn-inp" placeholder={ph} autoComplete="off" value={benef[key]} onChange={(e) => setBenef((b) => ({ ...b, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="exc-boxes">
                <div className="exc-box">
                  <p className="exc-lbl">Market Price</p>
                  <h2>{price ? price.toFixed(4) : "—"}</h2>
                  <p className="exc-sub">{toTicker} per {fromTicker}</p>
                </div>
                <div className="exc-box pink">
                  <p className="exc-lbl">You will receive</p>
                  <h2>{receive > 0 ? receive.toFixed(6) : "0.0"}</h2>
                  <p className="exc-sub">{toTicker} per {fromTicker}</p>
                  <div className="exc-feerow"><span>Exchange fee</span><span>{(exchangeFee > 0 ? exchangeFee : 0).toFixed(6)} {toTicker}</span></div>
                  <div className="exc-feerow"><span>Transaction fee</span><span>{(transactionFee > 0 ? transactionFee : 0).toFixed(6)} {toTicker}</span></div>
                </div>
              </div>

              <div className="exc-foot">
                <button className="btn btn-primary" style={{ padding: "14px 40px", fontSize: 16 }} onClick={execute}>Execute Trade</button>
              </div>
            </div>
          </section>
        )}

        {view === "order" && trade && (
          <section className="card exc-card">
            <div className="exc-head">
              <h1>OTC Order Request</h1>
              <p>Send the exact amount below to confirm your exchange</p>
            </div>
            <div className="exc-body">
              <div className="exc-deposit">
                <div className="exc-dep-hero">
                  <span className="exc-lbl">Amount to deposit</span>
                  <div className="exc-dep-amt">{trade.vol} {coinForKrakenName(trade.from)}</div>
                  <span className="exc-dep-net">{isFromEur ? "SEPA transfer" : `${fromAsset?.name || coinForKrakenName(trade.from)} network`}</span>
                </div>

                {!isFromEur ? (
                  <div className="exc-addr-box">
                    <span className="exc-addr-lbl">Deposit address</span>
                    <div className="exc-addr-line">
                      <span className="addr">{trade.depositAddr}</span>
                      <button className="ra-btn" onClick={() => { if (navigator.clipboard) void navigator.clipboard.writeText(trade.depositAddr); mwToast("Copied"); }}>Copy</button>
                    </div>
                  </div>
                ) : (
                  <div className="exc-benef">
                    <div className="exc-benef-sec" style={{ paddingTop: 0, borderTop: "none" }}>Multiwyre banking details</div>
                    <div className="exc-benef-row"><label>Beneficiary</label><span className="v mono">Multiwyre Ltd</span></div>
                    <div className="exc-benef-row"><label>IBAN</label><span className="v mono">LT12 3450 0400 1234 5678</span></div>
                    <div className="exc-benef-row"><label>SWIFT / BIC</label><span className="v mono">MWYRELT2X</span></div>
                    <div className="exc-benef-row"><label>Bank name</label><span className="v mono">Multiwyre EMI</span></div>
                    <div className="exc-benef-row"><label>Reference</label><span className="v mono">{trade.bankRef}</span></div>
                  </div>
                )}

                <div className="exc-note">
                  <IcInfo width={16} height={16} />
                  <p>Once confirmed, <b>{trade.receiveAmt} {coinForKrakenName(trade.to)}</b> will be sent to <span className="addr">{trade.dest}</span>.</p>
                </div>
              </div>
              <div className="exc-foot" style={{ justifyContent: "space-between" }}>
                <button className="btn btn-ghost" onClick={resetForm}>New Trade</button>
                <button className="btn btn-primary" onClick={onConfirm} disabled={busy}>Confirmed</button>
              </div>
            </div>
          </section>
        )}
      </div>

      <Modal
        open={tfaOpen}
        onClose={() => setTfaOpen(false)}
        title="Confirm your order"
        subtitle="Verify with your authenticator app to submit this trade"
        footer={<><button className="btn btn-ghost" onClick={() => setTfaOpen(false)}>Back</button><button className="btn btn-primary" onClick={onVerify} disabled={otp.length !== 6 || busy}>Confirm</button></>}
      >
        <div className="tfa-ic"><IcShieldLock width={26} height={26} /></div>
        <div className="tfa-copy">
          <h4>Enter your 6-digit code</h4>
          <p>Open your authenticator app and enter the code to confirm this OTC order.</p>
        </div>
        <Otp value={otp} onChange={(v) => { setOtp(v); setOtpErr(false); }} error={otpErr} autoFocus onEnter={onVerify} />
        {otpErr && <div className="err-msg" style={{ display: "block", textAlign: "center" }}>Incorrect code. Try again.</div>}
      </Modal>
    </div>
  );
};

export default ExchangeNew;
