import { useEffect, useMemo, useRef, useState } from "react";
import useGlobalStore from "~/store/useGlobalStore";
import { changeName, coinForKrakenName, coinName, dateValidation } from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import {
  fetchTransaferFeesApi,
  getFxMarkup,
  SendOTCTradeMail,
  saveEuroTemplate,
} from "~/service/ApiRequests";
import { verify2FAOTP } from "~/service/api/auth";
import { getCompanyBeneficiary, getEuroTemplates, getLimits, getOtcDepositAddresses, type CompanyBeneficiary, type OtcDepositAddress } from "~/service/api/transaction";
import { getCountries } from "~/service/api/lib";
import Modal from "~/components/mw/Modal";
import Otp from "~/components/mw/Otp";
import { IcShieldLock, IcInfo } from "~/components/mw/icons";
import mwToast from "~/components/mw/toast";

/** Same visuals as Admin walleticons — used when Azure Assets.icon URL fails locally. */
const LOCAL_COIN_ICON: Record<string, string> = {
  BTC: "/mw/coinicons/btc.svg",
  ETH: "/mw/coinicons/eth.svg",
  USDT: "/mw/coinicons/usdt.svg",
  "USDT.t": "/mw/coinicons/trx.svg",
  USDC: "/mw/coinicons/USDC.svg",
  EUR: "/mw/coinicons/eur.svg",
};

/** Admin Assets.icon first; local Admin SVGs if remote fails; letter last (QA #58). */
const AssetIcon = ({ icon, ticker }: { icon?: string; ticker: string }) => {
  const norm =
    LOCAL_COIN_ICON[ticker]
      ? ticker
      : (() => {
          const u = String(ticker || "").toUpperCase();
          if (u.includes("USDC")) return "USDC";
          if (u.includes("TRC20") || u === "USDT.T") return "USDT.t";
          if (u.includes("USDT")) return "USDT";
          if (u.startsWith("BTC")) return "BTC";
          if (u.startsWith("ETH")) return "ETH";
          if (u.startsWith("EUR")) return "EUR";
          return ticker;
        })();
  const letter = (norm || "?").charAt(0).toUpperCase();
  const remote = (icon ?? "").trim();
  const local = LOCAL_COIN_ICON[norm] ?? "";
  const [phase, setPhase] = useState<"remote" | "local" | "letter">(() =>
    remote ? "remote" : local ? "local" : "letter",
  );

  useEffect(() => {
    setPhase(remote ? "remote" : local ? "local" : "letter");
  }, [remote, local]);

  const src = phase === "remote" ? remote : phase === "local" ? local : "";
  const showImg = Boolean(src);

  return (
    <span className={`exc-coin${showImg ? " has-img" : ""}`}>
      {showImg ? (
        <img
          src={src}
          alt=""
          onError={() => {
            if (phase === "remote" && local) setPhase("local");
            else setPhase("letter");
          }}
        />
      ) : (
        letter
      )}
    </span>
  );
};

const pairs = [
  "BTC/USDC", "BTC/EUR", "USDC/EUR", "ETH/EUR", "ETH/USDC", "ETH/BTC",
  "USDC/USDT", "USDT/EUR", "USDC/USDT.t", "USDT.t/EUR", "BTC/USDT.t",
];
const availableCurrencies = ["BTC", "USDC", "EUR", "USDT", "ETH"];

const BENEF_FIELDS = [
  ["iban", "IBAN", true, "Enter IBAN"],
  ["name", "Customer name", true, "Full name"],
  ["addr", "Customer address", true, "Street address"],
  ["zip", "Customer ZIP code", true, "ZIP / postcode"],
  ["country", "Country", true, "Select country"],
] as const;
const BENEF_BANK = [
  ["swift", "Customer swift", true, "Enter SWIFT"],
  ["bank", "Bank name", true, "Bank name"],
  ["bankAddr", "Bank address", true, "Street, city"],
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
  const [benef, setBenef] = useState<Record<BenefKey, string>>({
    iban: "",
    name: "",
    addr: "",
    zip: "",
    country: "",
    swift: "",
    bank: "",
    bankAddr: "",
    bankCountry: "",
    ref: "",
  });
  const [view, setView] = useState<"form" | "order">("form");
  const [trade, setTrade] = useState<{
    vol: string;
    from: string;
    to: string;
    receiveAmt: string;
    dest: string;
    depositAddr: string;
    bankRef: string;
    price: string;
    exchangeFee: number;
    transactionFee: number;
    fxMarkUp: number;
    pairType: string;
  } | null>(null);
  const [tfaOpen, setTfaOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [limits, setLimits] = useState<Limits[]>([]);
  const [euroTemplates, setEuroTemplates] = useState<EuroMail[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [companyBenef, setCompanyBenef] = useState<CompanyBeneficiary | null>(null);
  const [companyBenefLoaded, setCompanyBenefLoaded] = useState(false);
  const [otcDeposits, setOtcDeposits] = useState<OtcDepositAddress[]>([]);
  const [otcDepositsLoaded, setOtcDepositsLoaded] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

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

  const reloadEuroTemplates = () => {
    void getEuroTemplates().then(([res]) => {
      if (res?.success && res.body) setEuroTemplates(res.body);
    });
  };

  useEffect(() => {
    if (dashboard.limitList) {
      void getLimits(dashboard.limitList).then(([res]) => {
        if (res?.success && res.body) setLimits(res.body);
      });
    }
    reloadEuroTemplates();
    void getCompanyBeneficiary().then(([res]) => {
      setCompanyBenefLoaded(true);
      if (res?.success && res.body) setCompanyBenef(res.body);
    });
    void getOtcDepositAddresses().then(([res]) => {
      setOtcDepositsLoaded(true);
      if (res?.success && Array.isArray(res.body)) setOtcDeposits(res.body);
    });
    void getCountries().then(([res]) => {
      if (res?.success && Array.isArray(res.body)) {
        const list = [...res.body].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        );
        setCountries(list);
      }
    });
  }, [dashboard.limitList]);

  useEffect(() => {
    const template = euroTemplates.find((item) => item.templateName === selectedTemplate);
    if (!template) return;
    setBenef((b) => ({
      ...b,
      iban: template.IBAN ?? "",
      name: template.customerName ?? "",
      addr: template.customerAddress ?? "",
      zip: template.customerZipcode ?? "",
      country: template.customerCountry ?? "",
      swift: template.swift ?? "",
      bank: template.bankName ?? "",
      bankAddr: template.bankAddress ?? "",
      bankCountry: template.bankCountry ?? "",
      ref: template.reference ?? "",
    }));
  }, [selectedTemplate, euroTemplates]);

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

  const companyIban = (companyBenef?.iban ?? "").trim();
  const companyConfigured = Boolean(companyIban && (companyBenef?.customerName ?? "").trim());

  const resolveOtcDepositAddress = (assetId: string) => {
    const keys = Array.from(
      new Set(
        [assetId, coinName(assetId), coinForKrakenName(assetId)]
          .map((k) => String(k || "").trim())
          .filter(Boolean),
      ),
    );
    for (const key of keys) {
      const hit = otcDeposits.find(
        (d) => d.assetId === key && String(d.address || "").trim(),
      );
      if (hit) return String(hit.address).trim();
    }
    return "";
  };

  const execute = () => {
    if (vol <= 0) return mwToast("Enter an amount");
    if (isFromEur) {
      if (!companyBenefLoaded) return mwToast("Loading settlement details…");
      if (!companyConfigured) {
        return mwToast("EUR settlement details are not configured yet. Contact support.");
      }
    } else {
      if (!otcDepositsLoaded) return mwToast("Loading deposit addresses…");
      if (!resolveOtcDepositAddress(from)) {
        return mwToast(
          `OTC deposit address is not configured for ${fromTicker}. Contact support.`,
        );
      }
    }
    let dest = "";
    if (isToEur) {
      if (
        !benef.iban ||
        !benef.name ||
        !benef.addr ||
        !benef.zip ||
        !benef.country ||
        !benef.swift ||
        !benef.bank ||
        !benef.bankAddr ||
        !benef.bankCountry
      ) {
        return mwToast("Fill in the required beneficiary details");
      }
      if (saveAsTemplate && !templateName.trim()) {
        return mwToast("Enter a template name to save");
      }
      dest = benef.iban;
    } else {
      dest = destAddr.trim();
      if (!dest) return mwToast("Enter a destination wallet address");
    }
    // OTC Exchange page: always desk flow (Pending History). Limits are informational only.
    const limitValue = isToEur ? receive : receive * (parseFloat(market) || 0);
    const otcLimitHit = limits.some((item) => {
      if ((item.currencyId !== coinName(toTicker) && item.currencyId !== "ANY") || item.exchangeType !== "OTC_TRADE") return false;
      if (item.exchangeLimit === "MIN") return limitValue <= Number(item.amount);
      if (item.exchangeLimit === "MAX") return limitValue >= Number(item.amount);
      return false;
    });
    if (otcLimitHit) {
      mwToast("Order size is outside auto limits — OTC desk will review this Pending order");
    }
    setTrade({
      vol: String(vol),
      from,
      to,
      receiveAmt: receive.toFixed(6),
      dest,
      depositAddr: isFromEur ? companyIban : resolveOtcDepositAddress(from),
      bankRef: `FX-${user.id}-${Date.now()}`,
      price: market,
      exchangeFee,
      transactionFee,
      fxMarkUp: fees.fxMarkUp,
      pairType: pairInfo.type,
    });
    setView("order");
  };

  const resetForm = () => {
    setView("form");
    setVolume("");
    setDestAddr("");
    setBenef({
      iban: "",
      name: "",
      addr: "",
      zip: "",
      country: "",
      swift: "",
      bank: "",
      bankAddr: "",
      bankCountry: "",
      ref: "",
    });
    setSelectedTemplate("");
    setSaveAsTemplate(false);
    setTemplateName("");
    setTrade(null);
  };

  /** OTC Exchange: create PENDING desk trade only — no Kraken, no balance debit. */
  const submitOrder = async () => {
    if (!trade) return;
    const spendAmt = Number(trade.vol);
    const receiveAmt = Number(trade.receiveAmt);
    if (!(spendAmt > 0) || !Number.isFinite(spendAmt)) {
      mwToast("Invalid spend amount");
      return;
    }
    setBusy(true);
    try {
      const otcPayload: OTCMail = {
        clientName: dashboard?.firstname ?? user?.fullname ?? "",
        contactPerson: dashboard?.lastname ?? "",
        accountNumber: trade.depositAddr,
        ordertype: trade.pairType,
        date: new Date().toISOString(),
        fromCurrency: coinName(trade.from),
        toCurrency: coinName(trade.to),
        amount: spendAmt,
        spendingCurrency: trade.from,
        receivingCurrency: trade.to,
        spendingAmount: spendAmt,
        receivingAmount: receiveAmt,
        price: parseFloat(trade.price) || 0,
        exchangeFee: trade.exchangeFee,
        transactionFee: trade.transactionFee,
        fxMarkUp: trade.fxMarkUp,
        type: trade.pairType,
        destinationAddress: trade.dest,
      };

      // Crypto → EUR: attach bank details so BE can persist EURO_TRANSACTIONS
      if (coinForKrakenName(trade.to) === "EUR") {
        otcPayload.IBAN = benef.iban;
        otcPayload.customerName = benef.name;
        otcPayload.customerAddress = benef.addr;
        otcPayload.customerZipcode = benef.zip;
        otcPayload.customerCity = benef.zip || "-";
        otcPayload.customerCountry = benef.country;
        otcPayload.swift = benef.swift;
        otcPayload.bankName = benef.bank;
        otcPayload.bankAddress = benef.bankAddr || "";
        otcPayload.bankLocation = "";
        otcPayload.bankCountry = benef.bankCountry;
        otcPayload.reference = benef.ref || trade.bankRef || "";
        otcPayload.paymentSystemType = "SEPA";
        otcPayload.transferFee = trade.transactionFee ?? 0;
        otcPayload.description = `OTC ${coinForKrakenName(trade.from)} → EUR`;
      }

      const [res, err] = await ApiHandler(SendOTCTradeMail, otcPayload);
      if (err || !res?.success) {
        mwToast(err || "Could not submit OTC order to desk");
        return;
      }

      // Persist beneficiary as EuroTemplate when user opted in
      if (
        coinForKrakenName(trade.to) === "EUR" &&
        saveAsTemplate &&
        templateName.trim()
      ) {
        const tplPayload = {
          templateName: templateName.trim(),
          IBAN: benef.iban,
          customerName: benef.name,
          customerAddress: benef.addr,
          customerZipcode: benef.zip,
          customerCity: benef.zip || "-",
          customerCountry: benef.country,
          swift: benef.swift,
          bankName: benef.bank,
          bankAddress: benef.bankAddr || "",
          bankLocation: "",
          bankCountry: benef.bankCountry,
          reference: benef.ref || trade.bankRef || "",
          description: `OTC template ${coinForKrakenName(trade.from)} → EUR`,
          paymentSystemType: "SEPA",
          isApproved: false,
          amount: "",
          userId: user?.id ?? "",
          firstname: dashboard?.firstname ?? "",
          lastname: dashboard?.lastname ?? "",
          id: "",
          currency: "EUR",
          transferFee: "",
        } as EuroMail;
        const [tplRes, tplErr] = await ApiHandler(saveEuroTemplate, tplPayload);
        if (tplErr || !tplRes?.success) {
          mwToast(
            tplErr ||
              "OTC order submitted, but beneficiary template could not be saved",
          );
        } else {
          reloadEuroTemplates();
        }
      }

      mwToast(res?.message || "OTC order submitted — view Pending in History → Trading History");
      setTfaOpen(false);
      resetForm();
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = () => {
    if (busy) return;
    if (user.tfaEnabled) {
      setOtp("");
      setOtpErr(false);
      setTfaOpen(true);
      return;
    }
    void submitOrder();
  };

  const onVerify = async () => {
    if (otp.length !== 6 || busy) return;
    setBusy(true);
    const [res, err] = await verify2FAOTP(otp);
    if (err || !res?.success) {
      setBusy(false);
      setOtpErr(true);
      setOtp("");
      return;
    }
    await submitOrder();
  };

  const CoinDropdown = ({ side }: { side: "from" | "to" }) => {
    const current = side === "from" ? from : to;
    const exclude = side === "from" ? to : from;
    const curAsset = assets.find((a) => a.assetId === current);
    return (
      <div className="exc-fld" style={{ position: "relative" }}>
        <label>{side === "from" ? "From" : "To"}</label>
        <div className="exc-select" onClick={(e) => { e.stopPropagation(); setMenu(menu === side ? "" : side); }}>
          <AssetIcon icon={curAsset?.icon} ticker={coinForKrakenName(current)} />
          <span>{curAsset?.name ?? coinForKrakenName(current)}</span>
          <svg className="chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
        <div className={`exc-menu${menu === side ? " open" : ""}`}>
          {assets.filter((a) => a.assetId !== exclude).map((a) => (
            <div key={a.assetId} className={`opt${a.assetId === current ? " on" : ""}`} onClick={(e) => { e.stopPropagation(); selectSide(side, a.assetId); }}>
              <AssetIcon icon={a.icon} ticker={coinForKrakenName(a.assetId)} />
              {a.name} ({coinForKrakenName(a.assetId)})
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
                  <div className="exc-benef-row">
                    <label>Saved beneficiary</label>
                    <select className="rn-inp" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                      <option value="">Select saved beneficiary</option>
                      {euroTemplates.map((item) => (
                        <option key={item.id} value={item.templateName}>{item.templateName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="exc-benef-sec">Customer Information</div>
                  <div className="exc-benef-grid">
                    {BENEF_FIELDS.map(([key, label, req, ph]) => (
                      <div className="exc-benef-row" key={key}>
                        <label>{label}{req && <span className="req">*</span>}</label>
                        {key === "country" ? (
                          <select
                            className="rn-inp"
                            value={benef.country}
                            onChange={(e) => setBenef((b) => ({ ...b, country: e.target.value }))}
                          >
                            <option value="">{ph}</option>
                            {benef.country &&
                              !countries.some((c) => c.name === benef.country) && (
                                <option value={benef.country}>{benef.country}</option>
                              )}
                            {countries.map((c) => (
                              <option key={c.id ?? c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="rn-inp"
                            placeholder={ph}
                            autoComplete="off"
                            value={benef[key]}
                            onChange={(e) => setBenef((b) => ({ ...b, [key]: e.target.value }))}
                          />
                        )}
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
                  <div className="exc-save-tpl">
                    <label className="exc-check">
                      <input
                        type="checkbox"
                        checked={saveAsTemplate}
                        onChange={(e) => {
                          setSaveAsTemplate(e.target.checked);
                          if (!e.target.checked) setTemplateName("");
                        }}
                      />
                      Save as Template
                    </label>
                    {saveAsTemplate && (
                      <div className="exc-benef-row">
                        <label>Template name<span className="req">*</span></label>
                        <input
                          className="rn-inp"
                          placeholder="e.g. My EUR beneficiary"
                          autoComplete="off"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                        />
                      </div>
                    )}
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
                    <div className="exc-benef-sec" style={{ paddingTop: 0, borderTop: "none" }}>Settlement banking details</div>
                    {!companyConfigured ? (
                      <p className="exc-note" style={{ margin: "8px 0 0" }}>
                        EUR settlement details are not configured. Ask an admin to set Beneficiary Details, then refresh.
                      </p>
                    ) : (
                      <>
                        {([
                          ["Beneficiary", companyBenef?.customerName],
                          ["IBAN", companyBenef?.iban || trade.depositAddr],
                          ["Address", companyBenef?.customerAddress],
                          ["ZIP", companyBenef?.customerZip],
                          ["SWIFT / BIC", companyBenef?.customerSwift],
                          ["Bank name", companyBenef?.bankName],
                          ["Bank address", companyBenef?.bankAddress],
                          ["Bank country", companyBenef?.bankCountry],
                        ] as const)
                          .filter(([, v]) => Boolean((v ?? "").trim()))
                          .map(([label, v]) => (
                            <div className="exc-benef-row" key={label}>
                              <label>{label}</label>
                              <span className="v mono">{v}</span>
                            </div>
                          ))}
                        <div className="exc-benef-row">
                          <label>Reference</label>
                          <span className="v mono">{trade.bankRef}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="exc-note">
                  <IcInfo width={16} height={16} />
                  <p>
                    Confirming sends this trade to the <b>OTC desk</b> as a <b>Pending</b> order
                    (no automatic exchange). Track it under History → Trading History.
                  </p>
                </div>
              </div>
              <div className="exc-foot" style={{ justifyContent: "space-between" }}>
                <button className="btn btn-ghost" onClick={resetForm} disabled={busy}>New Trade</button>
                <button className="btn btn-primary" onClick={onConfirm} disabled={busy}>{busy ? "Submitting…" : "Confirmed"}</button>
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
