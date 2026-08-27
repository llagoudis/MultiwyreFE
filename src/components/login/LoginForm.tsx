import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";
import toast, { Toaster } from "react-hot-toast";
import { fetchSecurity, login } from "~/service/ApiRequests";
import ErrorResponse from "~/service/ErrorResponse";
import { useRouter } from "next/router";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import { decryptResponse } from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import {goToDashboard} from "~/helpers/navigationHelper";
interface FormData {
  emailOrPhone: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { handleSubmit, control, watch, resetField } = useForm<FormData>();

  const router = useRouter();

  const [showEmailField, setShowEmailField] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitData = async (data: FormData) => {
    const { emailOrPhone, password } = data;
    setIsLoading(true);
    try {
      const myIp = localStorageService.getIPAddress();
      const res_en = await login({
        phone: emailOrPhone,
        password,
        ipAddress: myIp ?? "",
      });

      const res = decryptResponse(res_en.data);

      if (res.success) {
        const [sec_res, error]: APIResult<Security> =
          await ApiHandler(fetchSecurity);
        localStorageService.setSecurityBody(sec_res?.body);
        const switchAccounts = [];

        if (res?.body?.id) {
          switchAccounts.push({
            id: res?.body?.id,
            fullname: res?.body?.fullname,
            email: res.body?.email,
            profileImgLink: res.body?.profileImgLink,
            token: res.body?.token,
            phone: res.body?.phone,
            isUserVerified: res.body?.isUserVerified,
            isCompanyVerified: res.body?.isCompanyVerified,
            tfaEnabled: res.body?.tfaEnabled,
            isAddressVerified: res.body?.isAddressVerified,
            isIdentityVerified: res.body?.isIdentityVerified,
            isEmailVerified: res.body?.isEmailVerified,
            priceList: res.body?.priceList,
            countryCode: res.body?.countryCode,
            userType: res.body?.userType ?? "INDIVIDUAL",
            roles: res.body?.roles,
            invoiceImgLink: res.body?.invoiceImgLink,
          });
        }

        if (res?.body?.userType === "COMPANY") {
          res?.body?.projectUsers?.map((item: any) => {
            switchAccounts.push({
              fullname: item?.firstname,
              // email: item?.email,
              profileImgLink: item?.profileImgLink,
              invoiceImgLink: item?.invoiceImgLink,
              token: item?.token,
              phone: item?.phone,
              isUserVerified: item?.isUserVerified,
              tfaEnabled: item?.tfaEnabled,
              isCompanyVerified: item?.isCompanyVerified,
              isAddressVerified: item?.isAddressVerified,
              isIdentityVerified: item?.isIdentityVerified,
              isEmailVerified: item?.isEmailVerified,
              priceList: item?.priceList,
              id: item?.id,
              countryCode: item?.countyCode,
              userType: item?.userType,
              roles: res?.body?.roles,
            });
          });
        }

        res.body?.allStaffs?.map((item: any) => {
          switchAccounts.push({
            fullname: item?.User?.firstname + " " + item?.User?.lastname,
            email: item?.User?.email,
            profileImgLink: item?.User?.profileImgLink,
            token: item?.User?.token,
            phone: item?.User?.phone,
            isUserVerified: item?.User?.isUserVerified,
            tfaEnabled: item?.User?.tfaEnabled,
            isCompanyVerified: item?.User?.isCompanyVerified,
            isAddressVerified: item?.User?.isAddressVerified,
            isIdentityVerified: item?.User?.isIdentityVerified,
            isEmailVerified: item?.User?.isEmailVerified,
            priceList: item?.User?.priceList,
            id: item?.User?.id,
            countryCode: item?.User?.countyCode,
            userType: item?.User?.userType,
            roles: item?.roles,
            invoiceImgLink: item?.invoiceImgLink,
          });

          item?.projectUsers?.map((project: any) => {
            switchAccounts.push({
              fullname: project?.firstname,
              // email: project?.email,
              profileImgLink: project?.profileImgLink,
              invoiceImgLink: project?.invoiceImgLink,
              token: project?.token,
              phone: project?.phone,
              isUserVerified: project?.isUserVerified,
              tfaEnabled: project?.tfaEnabled,
              isCompanyVerified: project?.isCompanyVerified,
              isAddressVerified: project?.isAddressVerified,
              isIdentityVerified: project?.isIdentityVerified,
              isEmailVerified: project?.isEmailVerified,
              priceList: project?.priceList,
              id: project?.id,
              countryCode: project?.countyCode,
              userType: project?.userType,
              roles: item?.roles,
            });
          });
        });

        localStorageService.encodeSwitchAccounts(switchAccounts);

        // QA #67: individuals have null userType — persist a stable display value
        localStorageService.encodeAuthBody({
          ...res.body,
          userType: res.body?.userType ?? "INDIVIDUAL",
        });
        localStorageService.setLocalAccessToken(res.body?.token);
        // QA #68: drop prior user's wallets/dashboard before binding new session
        useGlobalStore.getState().clearUserScopedData();
        useGlobalStore.setState({
          user: res.body,
        });
        setIsLoading(false);
        goToDashboard("LOGIN")
      }
    } catch (error) {
      const message = ErrorResponse(error);

      resetField("password");

      if (message === "Ip blocked") {
        router.push("/auth/ipBlocked");
      }
      setIsLoading(false);
      toast.error(message);
    }
  };

  const onSubmit = (data: FormData) => {
    data.password && !showEmailField
      ? submitData(data)
      : setShowEmailField(false);
  };

  const emailOrPhone = watch("emailOrPhone");

  return (
    <>
      <Toaster />
      <div className="m-auto flex h-screen max-w-5xl items-center justify-center">
        <div className="rounded bg-white p-8 shadow-md md:w-[40%]">
          <h1 className="text-xl font-bold">Welcome back</h1>
          <p className=" mt-2 font-medium">Login to access your account</p>
          <form className=" mt-6 " onSubmit={handleSubmit(onSubmit)}>
            {showEmailField ? (
              <>
                <div className="mb-4">
                  <ExchangeInput
                    control={control}
                    placeholder="Enter the email or phone number"
                    label="Email/Phone number"
                    name="emailOrPhone"
                    type="text"
                    rules={{
                      required: "First name is required",
                      validate: (value: string) =>
                        value.trim() !== "" || "This field cannot be blank",
                    }}
                  />
                </div>
                <p className="mb-4 text-sm">
                  Not registered ?
                  <Link
                    className="mx-2 font-bold text-blue-600"
                    href="/auth/signup"
                  >
                    Signup here
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <div className="mb-2 block text-sm">Email / Phone number</div>
                  <div className="text-lg font-bold">{emailOrPhone}</div>
                </div>
                <div className="">
                  <ExchangeInput
                    control={control}
                    label="Enter password"
                    name="password"
                    type="password"
                    rules={{
                      required: "Password is required",
                    }}
                  />
                </div>
              </>
            )}
            {/* {!showEmailField && (
              <div className=" mb-4">
                <Link
                  className="text-sm font-medium text-blue-600"
                  href="/auth/forgotPassword"
                >
                  Forgot password
                </Link>
              </div>
            )} */}

            <div className="grid grid-flow-col ">
              {!showEmailField && (
                <button
                  className="w-full text-sm"
                  type="button"
                  onClick={() => {
                    setShowEmailField(true);
                    resetField("password");
                  }}
                >
                  Back
                </button>
              )}
              <Button
                className="flex w-full justify-center py-3 "
                title="Next"
                loading={isLoading}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
