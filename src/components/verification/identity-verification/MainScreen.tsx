import { Drawer } from "@mui/material";
import VerifyNow from "./VerifyNow";
import { useState, useEffect } from "react";
import VerifyEmail from "./VerifyEmail";
import EnterOTP from "./EnterOTP";
import DocumentSelection from "./DocumentSelection";
import DocumentUpload from "./DocumentUpload";
import VerifyAddress from "./VerifyAddress";
import SuccessMessage from "./SucessScreeen";
import {
  identityVerifyGetEmailOtp,
  identityVerifyOtp,
  identityVerifyDocUpload,
  identityVerifyAddressVerification,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import localStorageService from "~/service/LocalstorageService";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";

interface MainScreenProps {
  close: () => void;
}

interface Form {
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  state: string;
}

interface screenObj {
  verifyNowScreen: boolean;
  verifyEmailScreen: boolean;
  enterOTPScreen: boolean;
  documentSelection: boolean;
  documentUpload: boolean;
  verifyAddress: boolean;
  successScreen: boolean;
}

interface documentSelectionType {
  countryOfIssue: string;
  documentType: string;
}

const initialScreenObject = {
  verifyNowScreen: false,
  verifyEmailScreen: false,
  enterOTPScreen: false,
  documentSelection: false,
  documentUpload: false,
  verifyAddress: false,
  successScreen: false,
};

const MainScreen: React.FC<MainScreenProps> = ({ close }) => {
  const [identityVerificationObj, setVerificationScreenObj] =
    useState<screenObj>(initialScreenObject);

  const {
    verifyNowScreen,
    verifyEmailScreen,
    enterOTPScreen,
    documentSelection,
    documentUpload,
    verifyAddress,
    successScreen,
  } = identityVerificationObj;

  const [formData, setData] = useState({
    email: "",
    otp: "",
    countryOfIssue: "",
    documentType: "",
  });
  const countryList = useAsyncMasterStore<"country">("country");
  const [disableResendButton, setDisableResendButton] = useState<boolean>(true);
  const [time, setTime] = useState<string>("00:30");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangeScreen = (screen: string) => {
    const newScreenObj: any = { ...initialScreenObject };
    newScreenObj[screen] = true;
    setVerificationScreenObj(newScreenObj);
    localStorageService.updateVerification({
      identityVerificationObj: newScreenObj,
    });
  };

  const getLocalStorage = () => {
    const screenObject =
      localStorageService.decodeVerification()?.identityVerificationObj;
    if (!screenObject) {
      handleChangeScreen("verifyNowScreen");
    } else {
      setVerificationScreenObj(screenObject);
    }
  };

  const updateScreen = () => {
    const authBody = localStorageService.decodeAuthBody();
    if (authBody.isAddressVerified) {
      handleChangeScreen("successScreen");
    } else if (authBody.isIdentityVerified) {
      handleChangeScreen("verifyAddress");
    } else if (authBody.isEmailVerified) {
      handleChangeScreen("documentSelection");
    } else {
      getLocalStorage();
    }
  };
  useEffect(() => {
    updateScreen();
  }, []);

  const submitEmail = async (email: string) => {
    setLoading(true);
    setData({ ...formData, email });
    try {
      const [data, error] = await ApiHandler(identityVerifyGetEmailOtp, {
        email,
      });
      if (error) {
        toast.error(error);
      }
      if (data?.success) {
        handleChangeScreen("enterOTPScreen");
        executeTimer(30);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const submitOTP = async (otp: string) => {
    setLoading(true);
    setData({ ...formData, otp });
    const [data, error] = await ApiHandler(identityVerifyOtp, {
      email: formData.email,
      otp,
    });
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      handleChangeScreen("documentSelection");
    }
    setLoading(false);
  };

  const executeTimer = (seconds: number) => {
    setDisableResendButton(true);
    // Update the timer every second
    const intervalId = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(intervalId); // Stop the countdown when it reaches 0
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
    submitEmail(formData.email);
  };

  const submitDocSelection = (data: documentSelectionType) => {
    const finalData = { ...formData, ...data };
    setData(finalData);
    handleChangeScreen("documentUpload");
  };

  const submitDocUpload = async (fileDetails: any) => {
    setLoading(true);

    const documentForm = new FormData();
    documentForm.append("file", fileDetails);
    documentForm.append("documentType", formData.documentType);
    documentForm.append("countryOfIssue", formData.countryOfIssue);
    const [data, error] = await ApiHandler(
      identityVerifyDocUpload,
      documentForm,
    );
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      handleChangeScreen("verifyAddress");
    }
    setLoading(false);
  };

  const submitAddress = async (formdata: Form, file: any) => {
    setLoading(true);
    const { city, houseNumber, postalCode, state, street, country } = formdata;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("city", city);
    formData.append("country", country);
    formData.append("state", state);
    formData.append("addressLine1", street);
    formData.append("addressLine2", houseNumber);
    formData.append("postalCode", postalCode);
    const [data, error] = await ApiHandler(
      identityVerifyAddressVerification,
      formData,
    );
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      handleChangeScreen("successScreen");
    }
    setLoading(false);
  };

  return (
    <Drawer anchor={"right"} open={true}>
      <div className="w-[90vw] px-4 py-6 sm:w-[70vw] md:w-[40vw] md:px-[2rem] md:py-[3rem] lg:w-[32vw]">
        {verifyNowScreen && (
          <VerifyNow close={close} handleChangeScreen={handleChangeScreen} />
        )}

        {verifyEmailScreen && (
          <VerifyEmail
            close={close}
            handleChangeScreen={handleChangeScreen}
            email={formData.email}
            onEmailSubmit={submitEmail}
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
            loading={loading}
          />
        )}

        {documentSelection && (
          <DocumentSelection
            close={close}
            submitDocSelection={submitDocSelection}
            data={{
              countryOfIssue: formData.countryOfIssue,
              documentType: formData.documentType,
            }}
            countryList={countryList}
          />
        )}

        {documentUpload && (
          <DocumentUpload
            close={close}
            submitDocUpload={submitDocUpload}
            handleChangeScreen={handleChangeScreen}
            loading={loading}
          />
        )}

        {verifyAddress && (
          <VerifyAddress
            close={close}
            submitAddress={submitAddress}
            loading={loading}
            countryList={countryList}
          />
        )}

        {successScreen && (
          <SuccessMessage
            close={close}
            handleChangeScreen={handleChangeScreen}
          />
        )}
      </div>
    </Drawer>
  );
};

export default MainScreen;
