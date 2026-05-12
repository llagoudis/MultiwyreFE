import { Drawer } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import ProfileCreation from "./ProfileCreation";
import VerifyEmail from "./VerifyEmail";
import EnterOTP from "./EnterOTP";
import SetPassword from "./SetPassword";
import SuccessMessage from "./SuccessScreen";
import BasicInformation from "./BasicInformation";
import BasicInformation2 from "./BasicInformation2";
import BasicInformation3 from "./BasicInformation3";
import CompanyInformation from "./CompanyInformation";
import UploadFiles from "./UploadFiles";
import AccountCreationSuccess from "./AccountCreationSuccess";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import type { CompanyDataReq } from "~/types/CompanyVerification";
import {
  companyVerificationGetOtp,
  companyVerificationVerifyOtp,
  companyVerificationSetPassword,
  companyVerificationSubmitBasicEntity,
  companyVerificationSubmitPaymentInfo,
} from "~/service/ApiRequests";
import localStorageService from "~/service/LocalstorageService";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";

interface MainScreenProps {
  close: () => void;
}

interface screenObj {
  profileCreation: boolean;
  verifyEmailScreen: boolean;
  enterOTPScreen: boolean;
  setPassword: boolean;
  successScreen: boolean;
  basicInformation: boolean;
  basicInformation2: boolean;
  basicInformation3: boolean;
  paymentInformation: boolean;
  uploadFiles: boolean;
  accountCreationSuccess: boolean;
}

interface FileType {
  file: any;
}

const initialScreenObject = {
  profileCreation: false,
  verifyEmailScreen: false,
  enterOTPScreen: false,
  setPassword: false,
  successScreen: false,
  basicInformation: false,
  basicInformation2: false,
  basicInformation3: false,
  paymentInformation: false,
  uploadFiles: false,
  accountCreationSuccess: false,
};

const MainScreen: React.FC<MainScreenProps> = ({ close }) => {
  const countryList = useAsyncMasterStore<"country">("country");
  const legalFormsList = useAsyncMasterStore("legalForm");
  const businessNatureList = useAsyncMasterStore("businessNature");
  const paymentTypesList = useAsyncMasterStore("incomingPayments");
  const frequencyTypesList = useAsyncMasterStore("frequencies");
  const monthlyRemmitanceList = useAsyncMasterStore("monthlyRemmitance");

  const [companyVerificationScreenObj, setVerificationScreenObj] =
    useState<screenObj>(initialScreenObject);

  const {
    profileCreation,
    verifyEmailScreen,
    enterOTPScreen,
    setPassword,
    successScreen,
    basicInformation,
    basicInformation2,
    basicInformation3,
    paymentInformation,
    uploadFiles,
    accountCreationSuccess,
  } = companyVerificationScreenObj;

  const [companyData, setCompanyData] = useState({
    companyName: "",
    companyLegalForm: "",
    companyEmail: "",
    otp: "",
    otpTransactionId: "",
    password: "",
    incorporationDate: "",
    country: "",
    natureOfBusiness: "",
    registrationNumber: "",
    jurisdiction: "",
    operatingJurisdiction: "",
    city: "",
    addressLine1: "",
    postalCode: "",
    sameOperatingAddress: "",
    operatingAddressCity: "",
    operatingAddressAddressLine1: "",
    operatingAddressPostalCode: "",
    incomingPayments: "",
    outgoingPayments: "",
    frequency: "",
    expectedMonthlyRemittanceVolume: "",
    paymentFromCountry1: "",
    paymentFromCountry2: "",
    paymentFromCountry3: "",
    paymentToCountry1: "",
    paymentToCountry2: "",
    paymentToCountry3: "",
  });

  const {
    companyName,
    companyLegalForm,
    companyEmail,
    otp,
    otpTransactionId,
    incorporationDate,
    country,
    natureOfBusiness,
    registrationNumber,
    jurisdiction,
    operatingJurisdiction,
    city,
    addressLine1,
    postalCode,
    sameOperatingAddress,
    operatingAddressCity,
    operatingAddressAddressLine1,
    operatingAddressPostalCode,
    incomingPayments,
    outgoingPayments,
    frequency,
    expectedMonthlyRemittanceVolume,
    paymentFromCountry1,
    paymentFromCountry2,
    paymentFromCountry3,
    paymentToCountry1,
    paymentToCountry2,
    paymentToCountry3,
  } = useMemo(() => companyData, [companyData]);

  const [disableResendButton, setDisableResendButton] = useState<boolean>(true);
  const [time, setTime] = useState<string>("00:00");
  const [loading, setLoading] = useState<boolean>(false);

  const [files, setFiles] = useState<FileType[]>();

  const handleChangeScreen = (screen: string) => {
    const newScreenObj: any = { ...initialScreenObject };

    newScreenObj[screen] = true;
    setVerificationScreenObj(newScreenObj);
    localStorageService.updateVerification({
      companyVerificationScreenObj: newScreenObj,
    });
  };

  const getLocalStorage = () => {
    const screenObject = localStorageService.decodeVerification();
    if (!screenObject.companyVerificationScreenObj) {
      handleChangeScreen("profileCreation");
    } else {
      setVerificationScreenObj(screenObject.companyVerificationScreenObj);
    }
  };

  const updateScreen = () => {
    const authBody = localStorageService.decodeAuthBody();

    if (authBody.companyProfileDetails) {
      const companyData = authBody.companyProfileDetails;

      switch (true) {
        case !!companyData.CompanyPaymentsInfo:
          handleChangeScreen("accountCreationSuccess");
          break;

        case !!companyData.CompanyEntityInfo:
          handleChangeScreen("paymentInformation");
          break;

        case companyData.isPasswordSet:
          handleChangeScreen("basicInformation");
          break;

        case companyData.isEmailVerified:
          handleChangeScreen("basicInformation");
          break;

        default:
          handleChangeScreen("verifyEmailScreen");
          break;
      }
    } else {
      getLocalStorage();
    }
  };

  useEffect(() => {
    updateScreen();
  }, []);

  const submitProfile = (profile: CompanyDataReq) => {
    setCompanyData({ ...companyData, ...profile });
    handleChangeScreen("verifyEmailScreen");
  };

  const submitEmail = async (companyEmail: string, hitAPI = true) => {
    if (hitAPI) {
      setLoading(true);

      const [data, error]: APIResult<{ otpTransactionId: string }> =
        await ApiHandler(companyVerificationGetOtp, {
          companyEmail,
          companyName,
          companyLegalForm,
        });
      if (error) {
        toast.error(error);
      }
      if (data?.success) {
        setCompanyData({
          ...companyData,
          otpTransactionId: data?.body?.otpTransactionId,
          otp: "",
          companyEmail,
        });
        handleChangeScreen("enterOTPScreen");
        time === "00:00" && executeTimer(30);
      }
      setLoading(false);
    }
  };

  const submitOTP = async (otp: string, hitAPI = true) => {
    setCompanyData({ ...companyData, otp });
    if (hitAPI) {
      setLoading(true);
      const [data, error] = await ApiHandler(companyVerificationVerifyOtp, {
        code: otp,
        otpTransactionId,
      });
      if (error) {
        toast.error(error);
      }
      if (data?.success) {
        handleChangeScreen("setPassword");
      }
      setLoading(false);
    }
  };

  const submitPassword = async (password: string) => {
    setLoading(true);
    setCompanyData({ ...companyData, password });
    const [data, error] = await ApiHandler(companyVerificationSetPassword, {
      password,
    });
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      handleChangeScreen("successScreen");
    }
    setLoading(false);
  };

  const executeTimer = (seconds: number) => {
    setDisableResendButton(true);
    const intervalId = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(intervalId);
        setDisableResendButton(false);
      } else {
        seconds--;
        const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
        const remainingSeconds = String(seconds % 60).padStart(2, "0");
        // Time format MM:SS
        const formattedTime = `${minutes}:${remainingSeconds}`;
        setTime(formattedTime);
      }
    }, 1000);
  };

  const resendOTP = () => {
    submitEmail(companyEmail);
  };

  const submitBasicInfo = (values: CompanyDataReq) => {
    const newData = { ...companyData, ...values };
    setCompanyData(newData);
    handleChangeScreen("basicInformation2");
  };

  const submitBasicInfo2 = (values: CompanyDataReq) => {
    setCompanyData({ ...companyData, ...values });
    handleChangeScreen("basicInformation3");
  };

  const submitBasicInfo3 = async (values: CompanyDataReq, hitAPI = true) => {
    setCompanyData({ ...companyData, ...values });

    if (hitAPI) {
      setLoading(true);
      const { sameOperatingAddress } = values;

      const [data, error] = await ApiHandler(
        companyVerificationSubmitBasicEntity,
        sameOperatingAddress === "no"
          ? {
              ...values,
              country,
              natureOfBusiness,
              registrationNumber,
              incorporationDate,
              jurisdiction,
              city,
              addressLine1,
              postalCode,
              sameOperatingAddress: false,
            }
          : {
              country,
              natureOfBusiness,
              registrationNumber,
              incorporationDate,
              jurisdiction,
              city,
              addressLine1,
              postalCode,
              sameOperatingAddress: true,
              operatingAddressAddressLine1: addressLine1,
              operatingJurisdiction: jurisdiction,
              operatingAddressCity: city,
              operatingAddressPostalCode: postalCode,
            },
      );
      if (error) {
        toast.error(error);
      }
      if (data?.success) {
        handleChangeScreen("paymentInformation");
      }
      setLoading(false);
    }
  };

  const submitPaymentInfo = (values: CompanyDataReq) => {
    setCompanyData({ ...companyData, ...values });
    handleChangeScreen("uploadFiles");
  };

  const submitFiles = async (fileData: FileType[], hitAPI = true) => {
    setFiles(fileData);
    if (hitAPI) {
      const formData = new FormData();
      Object.entries(fileData).map((val: any) => {
        if (val[0].includes("supplimentDocuments")) {
          val[1] && formData.append("supplimentDocuments", val[1]);
        } else {
          val[1] && formData.append(val[0], val[1]);
        }
      });
      formData.append("incomingPayments", incomingPayments);
      formData.append("outgoingPayments", outgoingPayments);
      formData.append("frequency", frequency);
      expectedMonthlyRemittanceVolume &&
        formData.append(
          "monthlyRemittanceVolume",
          expectedMonthlyRemittanceVolume,
        );
      formData.append("paymentFromCountry1", paymentFromCountry1);
      formData.append("paymentFromCountry2", paymentFromCountry2);
      formData.append("paymentFromCountry3", paymentFromCountry3);
      formData.append("paymentToCountry1", paymentToCountry1);
      formData.append("paymentToCountry2", paymentToCountry2);
      formData.append("paymentToCountry3", paymentToCountry3);

      setLoading(true);
      const [data, error] = await ApiHandler(
        companyVerificationSubmitPaymentInfo,
        formData,
      );
      if (error) {
        toast.error(error);
      }
      if (data?.success) {
        handleChangeScreen("accountCreationSuccess");
      }
      setLoading(false);
    }
  };

  return (
    <Drawer anchor={"right"} open={true}>
      <div className=" w-[90vw] px-4 py-6 sm:w-[70vw] md:w-[40vw] md:px-[2rem] md:py-[3rem] lg:w-[32vw]">
        {profileCreation && (
          <ProfileCreation
            data={{ companyName, companyLegalForm }}
            close={close}
            submitProfile={submitProfile}
            legalFormsList={legalFormsList}
          />
        )}

        {verifyEmailScreen && (
          <VerifyEmail
            close={close}
            companyEmail={companyEmail}
            onEmailSubmit={submitEmail}
            handleChangeScreen={handleChangeScreen}
            loading={loading}
          />
        )}

        {enterOTPScreen && (
          <EnterOTP
            close={close}
            handleChangeScreen={handleChangeScreen}
            time={time}
            disableResendButton={disableResendButton}
            resendOTP={resendOTP}
            onOtpSubmit={submitOTP}
            otp={otp}
            email={companyEmail}
            loading={loading}
          />
        )}

        {setPassword && (
          <SetPassword
            close={close}
            onSubmit={submitPassword}
            handleChangeScreen={handleChangeScreen}
            loading={loading}
          />
        )}

        {successScreen && (
          <SuccessMessage
            close={close}
            handleChangeScreen={handleChangeScreen}
          />
        )}

        {basicInformation && (
          <BasicInformation
            data={{
              incorporationDate,
              country,
              natureOfBusiness,
              registrationNumber,
            }}
            close={close}
            submitBasicInfo={submitBasicInfo}
            countryOptions={countryList}
            natureOfBusinessOptions={businessNatureList}
          />
        )}

        {basicInformation2 && (
          <BasicInformation2
            submitBasicInfo={submitBasicInfo2}
            handleChangeScreen={handleChangeScreen}
            data={{ jurisdiction, city, addressLine1, postalCode }}
            countryOptions={countryList}
          />
        )}

        {basicInformation3 && (
          <BasicInformation3
            submitBasicInfo={submitBasicInfo3}
            handleChangeScreen={handleChangeScreen}
            data={{
              operatingJurisdiction,
              operatingAddressCity,
              operatingAddressAddressLine1,
              operatingAddressPostalCode,
              sameOperatingAddress,
            }}
            countryOptions={countryList}
            loading={loading}
          />
        )}

        {paymentInformation && (
          <CompanyInformation
            submitPaymentInfo={submitPaymentInfo}
            data={{
              incomingPayments,
              outgoingPayments,
              frequency,
              expectedMonthlyRemittanceVolume,
              paymentFromCountry1,
              paymentFromCountry2,
              paymentFromCountry3,
              paymentToCountry1,
              paymentToCountry2,
              paymentToCountry3,
            }}
            countryOptions={countryList}
            paymentOptions={paymentTypesList}
            frequencyOptions={frequencyTypesList}
            remittanceOptions={monthlyRemmitanceList}
            close={close}
          />
        )}

        {uploadFiles && (
          <UploadFiles
            handleChangeScreen={handleChangeScreen}
            submitFiles={submitFiles}
            loading={loading}
            data={files}
          />
        )}

        {accountCreationSuccess && <AccountCreationSuccess close={close} />}
      </div>
    </Drawer>
  );
};

export default MainScreen;
