import React, { useEffect, useState } from "react";
import SuccessMessage from "~/components/signup/SucessMsg";
import toast, { Toaster } from "react-hot-toast";
import { forgotPassword } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import ForgotPasswordForm from "~/components/forgot-password/ForgotPassword";
import CheckMail from "~/components/forgot-password/CheckMail";

interface FormData {
  email: string;
}

interface Screen {
  formScreen: boolean;
  mailCheck: boolean;
  successScreen: boolean;
}

const ForgotPassword = () => {
  const screenInitialValues = {
    formScreen: false,
    mailCheck: false,
    successScreen: false,
  };
  const [forgotPasswordData, setData] = useState<FormData>({
    email: "",
  });
  const [displayScreen, setDisplayScreen] =
    useState<Screen>(screenInitialValues);
  const [loading, setLoading] = useState(false);

  const { formScreen, mailCheck, successScreen } = displayScreen;

  useEffect(() => {
    changeScreen("formScreen");
  }, []);

  const changeScreen = (name: string) => {
    setDisplayScreen({ ...screenInitialValues, [name]: true });
  };

  const submitData = async (values: FormData) => {
    setLoading(true);
    setData(values);
    const { email } = values;
    const reqBody = {
      email: email,
    };

    const [data, error]: APIResult<{ otpTransactionId: string }> =
      await ApiHandler(forgotPassword, reqBody);
    if (error) {
      toast.error(error);
    }

    if (data?.success) {
      toast.success("Email sent successfully");
      changeScreen("mailCheck");
    }

    setLoading(false);
  };

  // const submitOTP = async (otp: string) => {
  //   setLoading(true);

  //   const [data, error] = await ApiHandler(verifyOtp, {
  //     code: otp,
  //     otpTransactionId,
  //   });

  //   if (error) {
  //     toast.error(error);
  //   }
  //   if (data?.success) {
  //     changeScreen("successScreen");
  //   }

  //   setLoading(false);
  // };

  return (
    <div className="bg-black">
      <Toaster />

      {formScreen && (
        <ForgotPasswordForm
          setData={(data: FormData) => submitData(data)}
          data={forgotPasswordData}
          loading={loading}
        />
      )}

      {mailCheck && <CheckMail />}

      {successScreen && <SuccessMessage />}
    </div>
  );
};

export default ForgotPassword;
