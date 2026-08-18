import { useEffect, useMemo, useState } from "react";
import Modal from "~/components/mw/Modal";
import Otp from "~/components/mw/Otp";
import { IcShieldLock, IcCheck } from "~/components/mw/icons";
import { baseTicker, coinMeta, networkOf } from "~/components/mw/assets";
import { createWhitelistAddress, updateWhitelistAddress } from "~/service/api/accounts";
import { verify2FAOTP } from "~/service/api/auth";
import mwToast from "~/components/mw/toast";

interface Variant { assetId: string; net: string | null }
interface Draft { base: string; assetId: string; net: string | null; address: string; label: string }

interface Props {
  open: boolean;
  onClose: () => void;
  assets: Assets[];
  tfaEnabled: boolean;
  editTarget: WhitelistAddress | null;
  onSubmitted: () => void;
}

type Phase = "details" | "tfa" | "done";
const EMPTY: Draft = { base: "", assetId: "", net: null, address: "", label: "" };

const AddAccountModal = ({ open, onClose, assets, tfaEnabled, editTarget, onSubmitted }: Props) => {
  const editing = !!editTarget;
  const [phase, setPhase] = useState<Phase>("details");
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errAddr, setErrAddr] = useState("");
  const [errLabel, setErrLabel] = useState("");
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState(false);
  const [busy, setBusy] = useState(false);

  // Group the real asset catalogue by base ticker -> network variants.
  const groups = useMemo(() => {
    const m = new Map<string, Variant[]>();
    for (const a of assets) {
      const base = baseTicker(a.fireblockAssetId);
      if (!m.has(base)) m.set(base, []);
      m.get(base)!.push({ assetId: a.fireblockAssetId, net: networkOf(a.fireblockAssetId) });
    }
    return m;
  }, [assets]);
  const bases = useMemo(() => [...groups.keys()], [groups]);
  const variants = draft.base ? groups.get(draft.base) ?? [] : [];
  const multiNet = variants.length > 1;

  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      const base = baseTicker(editTarget.assetId);
      setDraft({ base, assetId: editTarget.assetId, net: networkOf(editTarget.assetId), address: editTarget.assetAddress, label: editTarget.label });
    } else {
      setDraft(EMPTY);
    }
    setPhase("details");
    setOtp("");
    setOtpErr(false);
    setErrAddr("");
    setErrLabel("");
  }, [open, editTarget]);

  const pickBase = (base: string) => {
    const vs = groups.get(base) ?? [];
    setDraft((d) => ({ ...d, base, net: vs.length === 1 ? vs[0]!.net : null, assetId: vs.length === 1 ? vs[0]!.assetId : "" }));
  };
  const pickNet = (v: Variant) => setDraft((d) => ({ ...d, net: v.net, assetId: v.assetId }));

  const validateDetails = () => {
    setErrAddr("");
    setErrLabel("");
    let ok = true;
    if (!draft.base) { mwToast("Select an asset to continue"); return false; }
    if (multiNet && !draft.assetId) { mwToast("Select a network to continue"); return false; }
    if (draft.address.trim().length < 10) { setErrAddr(draft.address ? "That address looks too short." : "Enter the account address."); ok = false; }
    if (!draft.label.trim()) { setErrLabel("Give this account a label."); ok = false; }
    return ok;
  };

  const doCreate = async () => {
    setBusy(true);
    try {
      if (editing && editTarget) {
        const [res, err] = await updateWhitelistAddress(editTarget.id, {
          assetId: draft.assetId,
          label: draft.label.trim(),
          assetAddress: draft.address.trim(),
          description: "",
        });
        if (err || !res?.success) { mwToast(err || "Could not save the account"); setBusy(false); return; }
        onSubmitted();
        setPhase("done");
        return;
      }
      const [res, err] = await createWhitelistAddress({
        assetId: draft.assetId,
        label: draft.label.trim(),
        assetAddress: draft.address.trim(),
        description: "",
      });
      if (err || !res?.success) { mwToast(err || "Could not save the account"); setBusy(false); return; }
      onSubmitted();
      setPhase("done");
    } finally {
      setBusy(false);
    }
  };

  const onContinue = () => {
    if (!validateDetails()) return;
    if (tfaEnabled) setPhase("tfa");
    else void doCreate();
  };

  const onVerify = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    const [res, err] = await verify2FAOTP(otp);
    setBusy(false);
    if (err || !res?.success) {
      setOtpErr(true);
      setOtp("");
      return;
    }
    void doCreate();
  };

  const meta = draft.base ? coinMeta(draft.assetId || draft.base) : null;
  const totalSteps = tfaEnabled ? 3 : 2;
  const currentStep = phase === "details" ? 1 : phase === "tfa" ? 2 : totalSteps;

  const title = editing
    ? { details: "Edit account", tfa: "Two-factor authentication", done: "Changes submitted" }[phase]
    : { details: "Add account", tfa: "Two-factor authentication", done: "Account added" }[phase];
  const subtitle = editing
    ? { details: "Update the details below", tfa: "Confirm these changes", done: "" }[phase]
    : { details: "Choose an asset and network", tfa: "Confirm this new account", done: "" }[phase];

  let footer: React.ReactNode = null;
  if (phase === "details")
    footer = (
      <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onContinue} disabled={busy}>{editing ? "Save changes" : "Continue"}</button>
      </>
    );
  else if (phase === "tfa")
    footer = (
      <>
        <button className="btn btn-ghost" onClick={() => setPhase("details")}>Back</button>
        <button className="btn btn-primary" onClick={onVerify} disabled={otp.length !== 6 || busy}>Confirm</button>
      </>
    );
  else
    footer = (
      <>
        <button className="btn btn-ghost" onClick={() => { setDraft(EMPTY); setPhase("details"); }}>Add another</button>
        <button className="btn btn-primary" onClick={() => { onClose(); mwToast(draft.label + (editing ? " updated — pending admin approval" : " submitted — pending admin approval")); }}>Done</button>
      </>
    );

  const assetName = assets.find((a) => a.fireblockAssetId === draft.assetId)?.name ?? draft.base;

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} steps={{ total: totalSteps, current: currentStep }} footer={footer}>
      {phase === "details" && (
        <>
          <div className="fld">
            <label>Asset</label>
            <div className="pick">
              {bases.map((b) => {
                const cm = coinMeta(b);
                return (
                  <button key={b} className={draft.base === b ? "on" : ""} onClick={() => pickBase(b)} type="button">
                    <span className="g" style={{ background: cm.color }}>{cm.glyph}</span>
                    <span className="t">{b}</span>
                  </button>
                );
              })}
              {bases.length === 0 && <span className="hint" style={{ margin: 0 }}>Loading assets…</span>}
            </div>
          </div>

          <div className="fld">
            <label>Network</label>
            <div className="chips">
              {!draft.base ? (
                <span className="hint" style={{ margin: 0 }}>Select an asset first</span>
              ) : multiNet ? (
                variants.map((v) => (
                  <button key={v.assetId} className={draft.assetId === v.assetId ? "on" : ""} onClick={() => pickNet(v)} type="button">
                    {v.net ?? v.assetId}
                  </button>
                ))
              ) : (
                <button className="on" type="button" disabled>{variants[0]?.net ?? draft.base}</button>
              )}
            </div>
          </div>

          <div className="fld">
            <label htmlFor="fAddr">{draft.base === "EUR" ? "IBAN" : "Wallet address"}</label>
            <input
              id="fAddr"
              className={`inp mono${errAddr ? " err" : ""}`}
              placeholder={draft.base ? (draft.base === "EUR" ? "LT12 3450 0400 1234 5678" : "Wallet address") : "Select an asset first"}
              value={draft.address}
              disabled={!draft.base}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
            />
            <div className="hint">Double-check the address — transfers to a wrong address cannot be reversed.</div>
            {errAddr && <div className="err-msg">{errAddr}</div>}
          </div>

          <div className="fld">
            <label htmlFor="fLabel">Label</label>
            <input
              id="fLabel"
              className={`inp${errLabel ? " err" : ""}`}
              placeholder="e.g. Main, Treasury, Payroll"
              maxLength={24}
              value={draft.label}
              autoComplete="off"
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") onContinue(); }}
            />
            {errLabel && <div className="err-msg">{errLabel}</div>}
          </div>
        </>
      )}

      {phase === "tfa" && (
        <>
          <div className="tfa-ic"><IcShieldLock width={26} height={26} /></div>
          <div className="tfa-copy">
            <h4>Enter your 6-digit code</h4>
            <p>Open your authenticator app and enter the code to confirm {editing ? "changes to" : "adding"} <b>{draft.label}</b>.</p>
          </div>
          <Otp value={otp} onChange={(v) => { setOtp(v); setOtpErr(false); }} error={otpErr} autoFocus onEnter={onVerify} />
          {otpErr && <div className="err-msg" style={{ display: "block", textAlign: "center" }}>Incorrect code. Try again.</div>}
          <div className="resend">Verify with the code from your authenticator app.</div>
          <div className="review" style={{ marginTop: 18 }}>
            <div className="r"><span className="k">Asset</span><span className="v">{draft.base} · {assetName}</span></div>
            <div className="r"><span className="k">Network</span><span className="v">{draft.net ?? "—"}</span></div>
            <div className="r"><span className="k">{draft.base === "EUR" ? "IBAN" : "Address"}</span><span className="v mono">{draft.address}</span></div>
          </div>
        </>
      )}

      {phase === "done" && meta && (
        <>
          <div className="done">
            <div className="ring"><IcCheck width={30} height={30} /></div>
            <h4>{draft.label} {editing ? "updated" : "submitted"}</h4>
            <p>Your {assetName} account{draft.net ? ` on ${draft.net}` : ""} was saved and sent to an administrator for approval. You&apos;ll be notified once it&apos;s approved.</p>
          </div>
          <div className="review" style={{ marginTop: 18 }}>
            <div className="r"><span className="k">Label</span><span className="v">{draft.label}</span></div>
            <div className="r"><span className="k">Asset</span><span className="v">{draft.base} · {assetName}</span></div>
            <div className="r"><span className="k">Network</span><span className="v">{draft.net ?? "—"}</span></div>
            <div className="r"><span className="k">{draft.base === "EUR" ? "IBAN" : "Address"}</span><span className="v mono">{draft.address}</span></div>
            <div className="r"><span className="k">Status</span><span className="v" style={{ color: "#a16207", fontWeight: 700 }}>Pending admin approval</span></div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AddAccountModal;
