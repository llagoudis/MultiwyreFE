"use client";

import React, { Fragment } from "react";
import Image, { type StaticImageData } from "next/image";
import ProfileCompleted from "../../assets/general/profile-complete.svg";
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

  const findColorCode = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";

      case "SUBMITTED":
        return "bg-orange-500";

      case "REJECTED":
        return "bg-red-500";

      case "APPROVED":
        return "bg-green-500";
    }
  };

  const [open, setOpen] = useState("");

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

  return (
    <Fragment>
      <ChangeAuth open={open} handleClose={() => setOpen("")} />
      <div className="m-auto mb-8 mt-8  grid w-[95%] grid-cols-1 gap-5 md:grid-cols-2 md:gap-10">
        <div className="">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="aspect-square w-24 rounded-full border-[3px] border-[#C1922E]">
                  <Image
                    alt={"Profile"}
                    className="aspect-square w-full rounded-full object-cover"
                    src={
                      profileImgLink
                        ? `${profileImgLink}?t=${new Date().getTime()}`
                        : DefaultProfile
                    }
                    width={"100"}
                    height={"100"}
                  />
                </div>
                <p className="text-md text-center font-semibold">
                  Profile Icon
                </p>
              </div>
              <div>
                <p className=" mb-[24px] text-2xl font-bold">{fullname}</p>
              </div>
            </div>

            {UserType === "PROJECT" && (
              <div className="relative aspect-square w-24">
                {/* Image with border */}
                <div className="aspect-square w-full overflow-hidden rounded-full border-[3px] border-[#C1922E]">
                  <Image
                    alt="Invoice"
                    className="aspect-square w-full object-cover"
                    src={invoiceImgLink || DefaultProfile}
                    width={50}
                    height={50}
                  />
                </div>

                {/* Edit Icon Overlay */}

                <div
                  onClick={() => invoiceInputRef.current.click()}
                  className="absolute bottom-6 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-200"
                  title="Edit Invoice Icon"
                >
                  {loading === "invoiceImgLink" ? (
                    <ImSpinner2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CiCamera className="h-4 w-4 " />
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={invoiceInputRef}
                  onChange={(e: any) => {
                    submitInvoicePic(e.target.files[0]);
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />

                <p className="text-md text-center font-semibold">
                  Invoice Icon
                </p>
              </div>
            )}
          </div>

          {/* Profile photo  */}
          <div className="mt-16 flex items-start justify-between border-b-2 border-[#D9D9D9] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src={ProfileCompleted as StaticImageData}
                  alt="Profile completed"
                />
                <p className="text-base font-bold">Profile photo</p>
              </div>
              <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                Please upload a profile picture
              </p>
            </div>
            <div className="cursor-pointer">
              <input
                ref={fileInputRef}
                onChange={(e: any) => {
                  submitProfilePic(e.target.files[0]);
                }}
                type="file"
                accept="image/*"
                className=" hidden"
              />
              <Button
                type="button"
                className="ml-auto rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-800 lg:px-10"
                title="Change"
                loading={loading === "profileImgLink"}
                onClick={() => {
                  fileInputRef.current.click();
                }}
              />
            </div>
          </div>

          {/* Email Authentication */}
          <div className="mt-6 flex items-start justify-between border-b-2 border-[#D9D9D9] pb-6">
            <div className="w-4/5">
              <div className="flex items-center gap-2">
                <Image
                  src={ProfileCompleted as StaticImageData}
                  alt="Profile completed"
                />
                <p className="text-base font-bold">Email Authentication</p>
              </div>
              <p className="mt-2 text-xs font-bold">{email}</p>
              <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                For login, withdrawal, password retrieval, security settings
                changes and API management verification.
                {/* <span className=" text-[#217EFD]">Unlink here</span> */}
              </p>
            </div>
            <Button
              onClick={() => {
                handleOpen("email");
              }}
              type="submit"
              className="ml-auto rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-800 lg:px-10"
              title="Change"
            />
          </div>
          {/* SMS authentication */}
          <div className="mt-6 flex items-start justify-between border-b-2 border-[#D9D9D9] pb-6">
            <div className="w-4/5">
              <div className="flex gap-2">
                <Image
                  src={ProfileCompleted as StaticImageData}
                  alt="Profile completed"
                />
                <p className="text-base font-bold">SMS authentication</p>
              </div>
              <p className="mt-2 text-xs font-bold">{`${countryCode ?? ""} ${
                phone ?? ""
              }`}</p>
              <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                For login, withdrawal, password reset and change of security
                settings
              </p>
            </div>
            <Button
              onClick={() => {
                handleOpen("sms");
              }}
              type="submit"
              className="ml-auto rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-800 lg:px-10"
              title="Change"
            />
          </div>

          {/* Identity verification */}
          <div className="mt-6 flex items-start justify-between border-b-2 border-[#D9D9D9] pb-6">
            <div className="w-4/5">
              <div className="flex gap-2">
                <Image
                  src={ProfileCompleted as StaticImageData}
                  alt="Profile completed"
                />
                <p className="text-base font-bold">Identity verification</p>
              </div>

              <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                Complete verification to increase daily withdrawal limit
              </p>
            </div>
            <Button
              type="submit"
              className={`ml-auto rounded-md ${findColorCode(
                isUserVerified,
              )} pointer-events-none px-3 py-2 text-white lg:px-10`}
              title={isUserVerified}
            />
          </div>

          {/* Password */}
          <div className="mt-6 flex items-start justify-between border-b-2 border-[#D9D9D9] pb-6">
            <div className="w-4/5">
              <div className="flex gap-2">
                <Image
                  src={ProfileCompleted as StaticImageData}
                  alt="Profile completed"
                />
                <p className="text-base font-bold">Password</p>
              </div>

              <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                Change password in settings
              </p>
            </div>
            <Button
              type="submit"
              className="ml-auto rounded-md bg-blue-500  px-3 py-2 text-white hover:bg-blue-800 lg:px-10"
              title="Change"
              onClick={() => setChangePasswordModal(true)}
            />
          </div>

          {/* Google authenticator */}
          <div className="mt-6 flex items-start justify-between border-b-2 border-[#D9D9D9] pb-6">
            <div className="w-4/5">
              <div className="flex gap-2">
                <Image
                  src={ProfileCompleted as StaticImageData}
                  alt="Profile completed"
                />
                <p className="text-base font-bold">Google authenticator</p>
              </div>

              <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                Change password in settings
              </p>
            </div>
            <Button
              type="submit"
              className="ml-auto rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-800 lg:px-10"
              title={tfaEnabled || otpValidated ? "Verified" : "Enable"}
              onClick={() => get2FAQR()}
              disabled={tfaEnabled || otpValidated}
              loading={loading === "qr"}
            />
          </div>
          {/* End */}
        </div>
        <div className="flex flex-col gap-4">
          <div className="">
            <div className="mb-6 flex justify-between">
              <p className="text-base font-bold">Fees</p>
              {/* <p className="text-sm font-bold text-[#217EFD]">Outgoing</p> */}
            </div>

            {transferFees.map((item) => (
              <div className="mt-4 flex justify-between" key={item.id}>
                <div className="flex gap-2 ">
                  <Image src={TransfersIcon} alt="transfer logo" />
                  <span className="mt-1">
                    {oprationName(item?.operationType)} ({item.currencyId})
                  </span>
                </div>
                <p className="mt-1">
                  {item.percent}% + {item.fixedFee} {item.currencyId}
                </p>
              </div>
            ))}
          </div>
        </div>
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
