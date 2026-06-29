"use client";

import React, { Fragment } from "react";
import Image from "next/image";
import Button from "../../components/common/Button";
import { useState, useEffect, useRef } from "react";
import { ApiHandler } from "../../service/UtilService";
import {
  updatePassword,
  updateProfilePicture,
  get2FAQRCode,
  submit2FAOtp,
  updateInvoicePicture,
} from "../../service/ApiRequests";
import toast from "react-hot-toast";
import localStorageService from "../../service/LocalstorageService";
import { Modal } from "@mui/material";
import ChangePassword from "./ChangePassword";
import TwoFactorAuthentication from "./TwoFactorAuthentication";
import useGlobalStore from "~/store/useGlobalStore";
import DefaultProfile from "~/assets/images/defaultProfileImage.png";
import ChangeAuth from "./ChangeMobileEmail";
import {
  getTransferFeesByPricelistId,
  getOperationTypeUserpanel,
} from "../../service/api/pricelists";
import TransfersIcon from "../../assets/general/any-transfer.svg";
import { ImSpinner2 } from "react-icons/im";
import { CiCamera } from "react-icons/ci";

interface Form {
  currentPassword?: string;
  newPassword?: string;
  twoFactorCode?: string;
}

const Profile = () => {
  const fileInputRef: any = useRef(null);
  const invoiceInputRef: any = useRef(null);
  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);
  const invoiceImgLink = useGlobalStore((state) => state.user.invoiceImgLink);
  // const pricelistTrans = useGlobalStore((state) => state.user.priceList);
  // const test = useGlobalStore((state) => state.user);
  //
  const [loading, setLoading] = useState<
    | "profileImgLink"
    | "invoiceImgLink"
    | "password"
    | "qr"
    | "2fa"
    | "signal"
    | ""
  >("");

  const [twofaModal, setTwofaModal] = useState<boolean>(false);
  const [twofaQR, setTwofaQR] = useState<string>("");
  const [otpValidated, setOtpValidated] = useState<boolean>(false);

  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);

  const dashboard = useGlobalStore((state) => state.dashboard);
  useEffect(() => {
    useGlobalStore.getState().syncAdminProfile();
  }, [dashboard]);

  const submitProfilePic = async (file: any) => {
    setLoading("profileImgLink");
    const formData = new FormData();
    formData.append("file", file);
    const [data, error]: APIResult<{ profileImgLink: string; userId: string }> =
      await ApiHandler(updateProfilePicture, formData);
    if (error) {
      toast.error(error);
    }

    if (data?.success) {
      localStorageService.updateAuthBody({
        profileImgLink: data?.body?.profileImgLink,
      });

      localStorageService.updateSwitchAccounts({
        profileImgLink: data?.body?.profileImgLink,
        id: data?.body?.userId,
      });

      useGlobalStore.setState((prev) => ({
        ...prev,
        user: { ...prev.user, profileImgLink: data?.body?.profileImgLink },
      }));
      toast.success(data?.message ?? "");
    }
    setLoading("");
  };

  const submitInvoicePic = async (file: any) => {
    setLoading("invoiceImgLink");
    const formData = new FormData();
    formData.append("file", file);
    const [data, error]: APIResult<{ invoiceImgLink: string; userId: string }> =
      await ApiHandler(updateInvoicePicture, formData);
    if (error) {
      toast.error(error);
    }

    if (data?.success) {
      localStorageService.updateAuthBody({
        invoiceImgLink: data?.body?.invoiceImgLink,
      });

      useGlobalStore.setState((prev) => {
        const nextState = {
          ...prev,
          user: { ...prev.user, invoiceImgLink: data?.body?.invoiceImgLink },
        };
        return nextState;
      });

      // Update switchAccounts
      const accounts = localStorageService.decodeSwitchAccounts(); // array of accounts
      const updatedAccounts = accounts.map((acc: any) => {
        if (acc.id === data.body.userId) {
          return { ...acc, invoiceImgLink: data.body.invoiceImgLink };
        }
        return acc;
      });

      localStorageService.encodeSwitchAccounts(updatedAccounts);

      toast.success(data?.message ?? "");
    }
    setLoading("");
  };

  const changePassword = async (values: Form) => {
    setLoading("password");
    const [data, error]: APIResult<{ token: string }> = await ApiHandler(
      updatePassword,
      values,
    );
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      toast.success(data?.message ?? "");
      localStorageService.setLocalAccessToken(data?.body?.token);
      setChangePasswordModal(false);
    }
    setLoading("");
  };

  const get2FAQR = async () => {
    setLoading("qr");
    const [data, error]: APIResult<{ qrImage: string }> =
      await ApiHandler(get2FAQRCode);
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      setTwofaQR(data?.body?.qrImage);
      setTwofaModal(true);
    }
    setLoading("");
  };

  const submit2FACode = async (value: Form) => {
    const { twoFactorCode } = value;
    setLoading("2fa");
    const [data, error]: APIResult<{ userId: string }> = await ApiHandler(
      submit2FAOtp,
      {
        otp: twoFactorCode,
      },
    );
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      localStorageService.updateSwitchAccounts({
        tfaEnabled: true,
        id: data?.body?.userId,
      });

      localStorageService.updateAuthBody({ tfaEnabled: true });
      useGlobalStore.setState((prev) => ({
        ...prev,
        user: { ...prev.user, tfaEnabled: true },
      }));
      toast.success(data?.message ?? "");
      setTwofaModal(false);
      setOtpValidated(true);
    }
    setLoading("");
  };

  const [userDetails, setUserDetails] = useState<any>({
    countryCode: "",
    phone: "",
    email: "",
    fullname: "",
    isUserVerified: "SUBMITTED",
    tfaEnabled: "",
  });

  const { countryCode, phone, email, fullname, isUserVerified, tfaEnabled } =
    userDetails || {};

  useEffect(() => {
    const data = localStorageService.decodeAuthBody();

    setUserDetails(data);
  }, [dashboard]);

  const [open, setOpen] = useState("");
  const [activeTab, setActiveTab] = useState<"settings" | "fees">("settings");

  const handleOpen = (value: string) => {
    if (value) setOpen(value);
  };

  const [transferFees, setTransferFees] = useState<TransferFees[]>([]);
  const [operationType, setoperationType] = useState<TransferFees[]>([]);

  useEffect(() => {
    const getOperationType = async () => {
      const [res] = await getOperationTypeUserpanel();

      if (res !== null && "body" in res) {
        setoperationType(res.body);
      }
    };
    const getTransferFees = async () => {
      const [res] = await getTransferFeesByPricelistId(dashboard.priceList);
      if (res !== null && "body" in res) {
        setTransferFees(res.body);
      }
    };

    getOperationType();
    if (dashboard.priceList) getTransferFees();
  }, [dashboard.priceList]);

  function oprationName(id: any) {
    const name = operationType.find((item) => item.id === id);
    return name?.displayName ? name?.displayName : "";
  }
  const UserType =
    localStorageService.decodeAuthBody()?.userType === null
      ? "USER"
      : localStorageService.decodeAuthBody()?.userType;

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      APPROVED: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Approved" },
      PENDING: { bg: "bg-yellow-50", text: "text-yellow-600", label: "Pending" },
      SUBMITTED: { bg: "bg-orange-50", text: "text-orange-600", label: "Submitted" },
      REJECTED: { bg: "bg-red-50", text: "text-red-600", label: "Rejected" },
    };
    const s = map[status] ?? map.SUBMITTED;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${s.bg} ${s.text}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {s.label}
      </span>
    );
  };

  const groupedFees = transferFees.reduce<Record<string, TransferFees[]>>(
    (acc, item) => {
      const op = operationType.find((o) => o.id === item.operationType);
      const key = op?.name ?? "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {},
  );

  const FeeCard = ({
    title,
    description,
    iconBg,
    icon,
    items,
  }: {
    title: string;
    description: string;
    iconBg: string;
    icon: React.ReactNode;
    items: TransferFees[];
  }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-base font-bold text-black">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2 text-sm text-slate-500">
        <span>Description</span>
        <span>Fees</span>
      </div>
      {items && items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="mt-3 flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
              {oprationName(item?.operationType)} ({item.currencyId})
            </span>
            <span className="font-medium">
              {item.percent}% + {item.fixedFee} {item.currencyId}
            </span>
          </div>
        ))
      ) : (
        <p className="mt-6 text-center text-sm text-slate-400">
          No fees configured yet.
        </p>
      )}
    </div>
  );

  const pinkIcon = (path: React.ReactNode) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      {path}
    </svg>
  );

  return (
    <Fragment>
      <ChangeAuth open={open} handleClose={() => setOpen("")} />
      <div className="m-auto mb-8 mt-6 w-full space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`rounded-md px-5 py-3 text-sm font-semibold transition ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            Account Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fees")}
            className={`rounded-md px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "fees"
                ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            Fees
          </button>
        </div>

        {activeTab === "settings" && (
          <>
            {/* Profile card */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="aspect-square w-16 overflow-hidden rounded-full">
                  <Image
                    alt="Profile"
                    className="aspect-square w-full rounded-full object-cover"
                    src={
                      profileImgLink
                        ? `${profileImgLink}?t=${new Date().getTime()}`
                        : DefaultProfile
                    }
                    width={64}
                    height={64}
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-black">{fullname}</p>
                  <p className="text-xs text-slate-500">
                    This photo will be displayed on your profile.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  onChange={(e: any) => {
                    submitProfilePic(e.target.files[0]);
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={loading === "profileImgLink"}
                  className="flex items-center gap-2 rounded-md border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
                >
                  {loading === "profileImgLink" ? (
                    <ImSpinner2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CiCamera className="h-4 w-4" />
                  )}
                  Change Photo
                </button>
                {UserType === "PROJECT" && (
                  <>
                    <input
                      ref={invoiceInputRef}
                      onChange={(e: any) => {
                        submitInvoicePic(e.target.files[0]);
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => invoiceInputRef.current.click()}
                      disabled={loading === "invoiceImgLink"}
                      className="flex items-center gap-2 rounded-md border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
                    >
                      {loading === "invoiceImgLink" ? (
                        <ImSpinner2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CiCamera className="h-4 w-4" />
                      )}
                      Invoice Icon
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Security & Authentication */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-base font-bold text-black">
                  Security &amp; Authentication
                </p>
              </div>

              {/* Email */}
              <div className="flex items-start justify-between border-b border-slate-100 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                    {pinkIcon(
                      <>
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#F59E0B" strokeWidth="2" />
                        <path d="M3 7l9 6 9-6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                      </>,
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">
                      Email Authentication
                    </p>
                    <p className="text-sm font-medium text-black">{email}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Used for login, password recovery and security
                      notification.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpen("email")}
                  className="rounded-md border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Change
                </button>
              </div>

              {/* SMS */}
              <div className="flex items-start justify-between py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                    {pinkIcon(
                      <>
                        <rect x="6" y="2" width="12" height="20" rx="2" stroke="#F59E0B" strokeWidth="2" />
                        <circle cx="12" cy="18" r="1" fill="#F59E0B" />
                      </>,
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">
                      SMS Authentication
                    </p>
                    <p className="text-sm font-medium text-black">
                      {`${countryCode ?? ""} ${phone ?? ""}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Used for login, password recovery and security
                      notification.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpen("sms")}
                  className="rounded-md border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"
                      fill="#10B981"
                    />
                    <path
                      d="M8 12l2.5 2.5L16 9"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-base font-bold text-black">
                    Identity Verification
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Complete verification to increase daily withdrawl limit and
                  secure your account.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {statusBadge(isUserVerified)}
                <button
                  type="button"
                  className="rounded-md border border-blue-500 px-4 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  View/ Update
                </button>
              </div>
            </div>

            {/* Password + 2FA (preserve existing functionality) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-base font-bold text-black">Password</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Change password in settings
                  </p>
                </div>
                <Button
                  type="submit"
                  className="ml-auto rounded-md border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  title="Change"
                  onClick={() => setChangePasswordModal(true)}
                />
              </div>
              <div className="flex items-start justify-between pt-4">
                <div>
                  <p className="text-base font-bold text-black">
                    Google authenticator
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Enable 2FA for additional account security.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="ml-auto rounded-md border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  title={tfaEnabled || otpValidated ? "Verified" : "Enable"}
                  onClick={() => get2FAQR()}
                  loading={loading === "qr"}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "fees" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FeeCard
              title="Transfer Fees"
              description="Fees for transferring funds to other wallets."
              iconBg="bg-pink-50"
              icon={
               <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.28 4.21975L13.28 0.21975C12.987 -0.07325 12.512 -0.07325 12.219 0.21975C11.926 0.51275 11.926 0.98775 12.219 1.28075L14.939 4.00075H0.75C0.336 4.00075 0 4.33675 0 4.75075C0 5.16475 0.336 5.50075 0.75 5.50075H16.75C17.053 5.50075 17.327 5.31775 17.443 5.03775C17.559 4.75775 17.495 4.43375 17.28 4.21975Z" fill="#DB33A1"/>
<path d="M16.7501 8.00002H0.750077C0.447077 8.00002 0.173077 8.18302 0.0570767 8.46302C-0.0589233 8.74302 0.00507681 9.06602 0.220077 9.28002L4.22008 13.28C4.36608 13.426 4.55808 13.5 4.75008 13.5C4.94208 13.5 5.13408 13.427 5.28008 13.28C5.57308 12.987 5.57308 12.512 5.28008 12.219L2.56008 9.49902H16.7491C17.1631 9.49902 17.4991 9.16302 17.4991 8.74902C17.4991 8.33502 17.1631 7.99902 16.7491 7.99902L16.7501 8.00002Z" fill="#DB33A1"/>
</svg>

              }
              items={groupedFees.outgoingTransfer ?? []}
            />
            <FeeCard
              title="Transfer Fees"
              description="Fees for transferring funds to other wallets."
              iconBg="bg-pink-50"
              icon={
               <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.28 4.21975L13.28 0.21975C12.987 -0.07325 12.512 -0.07325 12.219 0.21975C11.926 0.51275 11.926 0.98775 12.219 1.28075L14.939 4.00075H0.75C0.336 4.00075 0 4.33675 0 4.75075C0 5.16475 0.336 5.50075 0.75 5.50075H16.75C17.053 5.50075 17.327 5.31775 17.443 5.03775C17.559 4.75775 17.495 4.43375 17.28 4.21975Z" fill="#DB33A1"/>
<path d="M16.7501 8.00002H0.750077C0.447077 8.00002 0.173077 8.18302 0.0570767 8.46302C-0.0589233 8.74302 0.00507681 9.06602 0.220077 9.28002L4.22008 13.28C4.36608 13.426 4.55808 13.5 4.75008 13.5C4.94208 13.5 5.13408 13.427 5.28008 13.28C5.57308 12.987 5.57308 12.512 5.28008 12.219L2.56008 9.49902H16.7491C17.1631 9.49902 17.4991 9.16302 17.4991 8.74902C17.4991 8.33502 17.1631 7.99902 16.7491 7.99902L16.7501 8.00002Z" fill="#DB33A1"/>
</svg>

              }
              items={groupedFees.transferFee ?? []}
            />
            <FeeCard
              title="Network Fees"
              description="Fess charged by blockchain networks."
              iconBg="bg-pink-50"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="6" cy="6" r="2" stroke="#DB33A1" strokeWidth="2" />
                  <circle cx="18" cy="6" r="2" stroke="#DB33A1" strokeWidth="2" />
                  <circle cx="12" cy="18" r="2" stroke="#DB33A1" strokeWidth="2" />
                  <path d="M7 7l4 9M17 7l-4 9" stroke="#DB33A1" strokeWidth="2" />
                </svg>
              }
              items={groupedFees.networkFees ?? []}
            />
            <FeeCard
              title="Exchange Fees"
              description="Fees for exchange one currency to another"
              iconBg="bg-pink-50"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8h14l-3-3M20 16H6l3 3" stroke="#DB33A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              items={
                groupedFees.exchangeFees ?? groupedFees.fxMarkupFees ?? []
              }
            />
            <div className="md:col-span-2">
              <FeeCard
                title="Ecommerce Fees"
                description="Fees for ecommerce and payment getway services."
                iconBg="bg-pink-50"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 4h2l2 12h11l2-8H6" stroke="#DB33A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="20" r="1.5" stroke="#DB33A1" strokeWidth="2" />
                    <circle cx="17" cy="20" r="1.5" stroke="#DB33A1" strokeWidth="2" />
                  </svg>
                }
                items={groupedFees.invoiceFees ?? []}
              />
            </div>
          </div>
        )}
      </div>
      <Modal open={changePasswordModal}>
        <div className="flex h-screen items-center justify-center">
          <div className="w-full max-w-2xl rounded bg-white p-10 shadow-md">
            <ChangePassword
              close={() => setChangePasswordModal(false)}
              submitData={changePassword}
              loading={loading === "password"}
            />
          </div>
        </div>
      </Modal>
      <Modal open={twofaModal}>
        <div className="flex h-screen items-center justify-center">
          <div className="mx-2 rounded bg-white p-8 shadow-md md:max-w-md">
            <TwoFactorAuthentication
              submitData={submit2FACode}
              close={() => setTwofaModal(false)}
              loading={loading === "2fa"}
              twofaQR={twofaQR}
            />
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default Profile;
