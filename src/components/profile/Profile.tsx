"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Modal } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "../../service/UtilService";
import { fetchCheckoutFees, get2FAQRCode, submit2FAOtp, updatePassword, updateProfilePicture } from "../../service/ApiRequests";
import { getOperationTypeUserpanel, getTransferFeesByPricelistId } from "../../service/api/pricelists";
import { getAllCustomerMerchants } from "../../service/api/accounts";
import localStorageService from "../../service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import ChangePassword from "./ChangePassword";
import TwoFactorAuthentication from "./TwoFactorAuthentication";
import ChangeAuth from "./ChangeMobileEmail";
import OrgManagement from "./OrgManagement";
import IdentityVerificationMainScreen from "../verification/identity-verification/MainScreen";
import mwToast from "~/components/mw/toast";
import { IcCamera } from "~/components/mw/icons";

interface Form { currentPassword?: string; newPassword?: string; twoFactorCode?: string }
type ProfileTab = "settings" | "fees" | "org";

const DEFAULT_AVATAR = "/mw/images/defaultProfile.svg";

const feeIcon = (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M17.28 4.22 13.28.22a.75.75 0 0 0-1.06 1.06l2.72 2.72H.75a.75.75 0 0 0 0 1.5h16a.75.75 0 0 0 .53-1.28Z" fill="#DB33A1" /><path d="M16.75 8H.75a.75.75 0 0 0-.53 1.28l4 4a.75.75 0 0 0 1.06-1.06L2.56 9.5h14.19a.75.75 0 0 0 0-1.5Z" fill="#DB33A1" /></svg>
);

const humanize = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/\s+/g, " ").trim();

const Profile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImgLink = useGlobalStore((s) => s.user.profileImgLink);
  const dashboard = useGlobalStore((s) => s.dashboard);

  const [loading, setLoading] = useState<"" | "profileImgLink" | "password" | "2fa">("");
  const [twofaModal, setTwofaModal] = useState(false);
  const [twofaQR, setTwofaQR] = useState("");
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [open, setOpen] = useState(""); // ChangeAuth: "email" | "sms"
  const [tab, setTab] = useState<ProfileTab>("settings");
  const [identityOpen, setIdentityOpen] = useState(false);

  const [userDetails, setUserDetails] = useState<{ email?: string; phone?: string; countryCode?: string; fullname?: string; isUserVerified?: string; tfaEnabled?: boolean }>({});
  const { email, phone, countryCode, fullname, isUserVerified, tfaEnabled } = userDetails;

  const [transferFees, setTransferFees] = useState<TransferFees[]>([]);
  const [operationType, setOperationType] = useState<TransferFees[]>([]);
  const [ecommerceFees, setEcommerceFees] = useState<any[]>([]);

  useEffect(() => { useGlobalStore.getState().syncAdminProfile(); }, [dashboard]);
  useEffect(() => { setUserDetails(localStorageService.decodeAuthBody() ?? {}); }, [dashboard]);

  useEffect(() => {
    void (async () => {
      const [opRes] = await getOperationTypeUserpanel();
      if (opRes && "body" in opRes && opRes.body) setOperationType(opRes.body as TransferFees[]);
      if (dashboard.priceList) {
        const [feeRes] = await getTransferFeesByPricelistId(dashboard.priceList);
        if (feeRes && "body" in feeRes && feeRes.body) setTransferFees(feeRes.body as TransferFees[]);
      }
    })();
  }, [dashboard.priceList]);

  useEffect(() => {
    void (async () => {
      const [merchantRes] = await getAllCustomerMerchants();
      const merchant = merchantRes?.body?.[0];
      const merchantId = merchant?.projectId ?? merchant?.id;
      if (!merchantId) {
        setEcommerceFees([]);
        return;
      }
      const [feesRes, error] = await ApiHandler(fetchCheckoutFees, { id: merchantId });
      if (error) return;
      const feeRows =
        feesRes?.body?.merchant?.User?.PriceList?.TransferFees ??
        feesRes?.body?.merchant?.PriceList?.TransferFees ??
        [];
      setEcommerceFees(feeRows);
    })();
  }, []);

  const operationName = (id?: number) => operationType.find((o) => o.id === id)?.displayName ?? "";

  const groupedFees = transferFees.reduce<Record<string, TransferFees[]>>((acc, item) => {
    const op = operationType.find((o) => o.id === item.operationType);
    const key = op?.name ?? "Other Fees";
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  // ---- handlers (preserved from the existing Profile) ----
  const submitProfilePic = async (file: File) => {
    setLoading("profileImgLink");
    const fd = new FormData();
    fd.append("file", file);
    const [data, error]: APIResult<{ profileImgLink: string; userId: string }> = await ApiHandler(updateProfilePicture, fd);
    if (error) toast.error(error);
    if (data?.success) {
      localStorageService.updateAuthBody({ profileImgLink: data?.body?.profileImgLink });
      localStorageService.updateSwitchAccounts({ profileImgLink: data?.body?.profileImgLink, id: data?.body?.userId });
      useGlobalStore.setState((prev) => ({ ...prev, user: { ...prev.user, profileImgLink: data?.body?.profileImgLink } }));
      toast.success(data?.message ?? "Photo updated");
    }
    setLoading("");
  };

  const changePassword = async (values: Form) => {
    setLoading("password");
    const [data, error]: APIResult<{ token: string }> = await ApiHandler(updatePassword, values);
    if (error) toast.error(error);
    if (data?.success) {
      toast.success(data?.message ?? "Password updated");
      localStorageService.setLocalAccessToken(data?.body?.token);
      setChangePasswordModal(false);
    }
    setLoading("");
  };

  const get2FAQR = async () => {
    const [data, error]: APIResult<{ qrImage: string }> = await ApiHandler(get2FAQRCode);
    if (error) toast.error(error);
    if (data?.success) { setTwofaQR(data?.body?.qrImage); setTwofaModal(true); }
  };

  const submit2FACode = async (value: Form) => {
    setLoading("2fa");
    const [data, error]: APIResult<{ userId: string }> = await ApiHandler(submit2FAOtp, { otp: value.twoFactorCode });
    if (error) toast.error(error);
    if (data?.success) {
      localStorageService.updateSwitchAccounts({ tfaEnabled: true, id: data?.body?.userId });
      localStorageService.updateAuthBody({ tfaEnabled: true });
      useGlobalStore.setState((prev) => ({ ...prev, user: { ...prev.user, tfaEnabled: true } }));
      toast.success(data?.message ?? "2FA enabled");
      setTwofaModal(false);
      setUserDetails((u) => ({ ...u, tfaEnabled: true }));
    }
    setLoading("");
  };

  const identityApproved = (isUserVerified ?? "").toUpperCase() === "APPROVED";

  return (
    <Fragment>
      <ChangeAuth open={open} handleClose={() => setOpen("")} />
      {identityOpen && <IdentityVerificationMainScreen close={() => setIdentityOpen(false)} />}

      <Modal open={changePasswordModal} onClose={() => setChangePasswordModal(false)} className="flex items-center justify-center">
        <div className="w-[420px] max-w-[92vw] rounded-2xl bg-white p-6 outline-none">
          <ChangePassword close={() => setChangePasswordModal(false)} submitData={changePassword} loading={loading === "password"} />
        </div>
      </Modal>

      <Modal open={twofaModal} onClose={() => setTwofaModal(false)} className="flex items-center justify-center">
        <div className="w-[520px] max-w-[94vw] rounded-2xl bg-white p-6 outline-none">
          <TwoFactorAuthentication close={() => setTwofaModal(false)} submitData={submit2FACode} loading={loading === "2fa"} twofaQR={twofaQR} />
        </div>
      </Modal>

      <div className="view" id="viewProfile">
        <div className="pview">
          <section className="card ptabs">
            <button className={`ptab${tab === "settings" ? " on" : ""}`} onClick={() => setTab("settings")}>Account Settings</button>
            <button className={`ptab${tab === "fees" ? " on" : ""}`} onClick={() => setTab("fees")}>Fees</button>
            <button className={`ptab${tab === "org" ? " on" : ""}`} onClick={() => setTab("org")}>Organisation Management</button>
          </section>

          {/* ---------- Account Settings ---------- */}
          {tab === "settings" && (
            <div className="ppane">
              <section className="card prow">
                <div className="pl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="pavatar"
                    src={profileImgLink || DEFAULT_AVATAR}
                    alt="Profile"
                    width={62}
                    height={62}
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el.src.includes("defaultProfile.svg")) return;
                      el.src = DEFAULT_AVATAR;
                    }}
                  />
                  <div>
                    <p className="pt">{fullname || "Your account"}</p>
                    <p className="ps">This photo will be displayed on your profile.</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && submitProfilePic(e.target.files[0])} />
                <button className="btn-blue" disabled={loading === "profileImgLink"} onClick={() => fileInputRef.current?.click()}>
                  <IcCamera width={15} height={15} /> {loading === "profileImgLink" ? "Uploading…" : "Change Photo"}
                </button>
              </section>

              <section className="card psec">
                <div className="psec-head">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" /></svg>
                  <p className="pt">Security &amp; Authentication</p>
                </div>
                <div className="pitem bd">
                  <div className="pl">
                    <div className="pic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#F59E0B" strokeWidth="2" /><path d="M3 7l9 6 9-6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" /></svg></div>
                    <div>
                      <p className="pt sm">Email Authentication</p>
                      <p className="pv">{email || "—"}</p>
                      <p className="ps">Used for login, password recovery and security notification.</p>
                    </div>
                  </div>
                  <button className="btn-blue" onClick={() => setOpen("email")}>Change</button>
                </div>
                <div className="pitem">
                  <div className="pl">
                    <div className="pic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="6" y="2" width="12" height="20" rx="2" stroke="#F59E0B" strokeWidth="2" /><circle cx="12" cy="18" r="1" fill="#F59E0B" /></svg></div>
                    <div>
                      <p className="pt sm">SMS Authentication</p>
                      <p className="pv">{phone ? `${countryCode ?? ""} ${phone}` : "—"}</p>
                      <p className="ps">Used for login, password recovery and security notification.</p>
                    </div>
                  </div>
                  <button className="btn-blue" onClick={() => setOpen("sms")}>Change</button>
                </div>
              </section>

              <section className="card prow">
                <div>
                  <div className="psec-head" style={{ margin: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" fill="#10B981" /><path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <p className="pt">Identity Verification</p>
                  </div>
                  <p className="ps" style={{ marginTop: 8 }}>Complete verification to increase daily withdrawal limit and secure your account.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className="vbadge" style={identityApproved ? undefined : { background: "#fff7ed", color: "#c2410c" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {identityApproved ? "Approved" : (isUserVerified ? isUserVerified.charAt(0) + isUserVerified.slice(1).toLowerCase() : "Pending")}
                  </span>
                  <button className="btn-blue" onClick={() => setIdentityOpen(true)}>View/ Update</button>
                </div>
              </section>

              <section className="card psec">
                <div className="pitem bd">
                  <div><p className="pt">Password</p><p className="ps">Change password in settings</p></div>
                  <button className="btn-blue" onClick={() => setChangePasswordModal(true)}>Change</button>
                </div>
                <div className="pitem">
                  <div><p className="pt">Google authenticator</p><p className="ps">Enable 2FA for additional account security.</p></div>
                  <button className="btn-blue" onClick={() => (tfaEnabled ? mwToast("2FA is already verified") : get2FAQR())}>{tfaEnabled ? "Verified" : "Enable"}</button>
                </div>
              </section>
            </div>
          )}

          {/* ---------- Fees ---------- */}
          {tab === "fees" && (
            <div className="ppane">
              <div className="fee-grid">
                {Object.entries(groupedFees).map(([key, items]) => (
                  <div className="fee-card" key={key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="fee-ic">{feeIcon}</div>
                      <div><p className="pt">{humanize(key)}</p><p className="ps">Fees applied to {humanize(key).toLowerCase()}.</p></div>
                    </div>
                    <div className="fee-cols"><span>Description</span><span>Fees</span></div>
                    {items.length ? items.map((item) => (
                      <div className="fee-row" key={item.id}>
                        <span className="n"><span className="dot" />{operationName(item.operationType)} ({item.currencyId})</span>
                        <span className="f">{item.percent}% + {item.fixedFee} {item.currencyId}</span>
                      </div>
                    )) : <p className="fee-none">No fees configured yet.</p>}
                  </div>
                ))}
                <div className="fee-card wide">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="fee-ic">{feeIcon}</div>
                    <div><p className="pt">Ecommerce Fees</p><p className="ps">Fees for ecommerce and payment gateway services.</p></div>
                  </div>
                  <div className="fee-cols"><span>Description</span><span>Fees</span></div>
                  {ecommerceFees.length ? ecommerceFees.map((item: any) => (
                    <div className="fee-row" key={`ecom-${item.id}`}>
                      <span className="n"><span className="dot" />{operationName(item.operationType) || "Ecommerce"} ({item.currencyId})</span>
                      <span className="f">{item.percent}% + {item.fixedFee} {item.currencyId}</span>
                    </div>
                  )) : <p className="fee-none">No fees configured yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ---------- Organisation Management ---------- */}
          {tab === "org" && (
            <div className="ppane">
              <OrgManagement ownerEmail={email ?? ""} />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Profile;
