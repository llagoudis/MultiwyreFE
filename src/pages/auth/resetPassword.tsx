import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import ForgotPasswordImage from "~/assets/general/forgot-password.png";
import { resetPassword } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";

const ResetPassword = () => {
  return (
    <div className="fixed inset-0 flex h-screen w-full items-center justify-center overflow-y-auto bg-black">
      <div className=" flex max-w-[467px] flex-col items-center gap-4 rounded-md bg-white p-10">
        <div className=" ml-auto h-44 w-44 rounded-full bg-[#f6eedc] p-4">
          <Image
            className=" h-full w-full"
            src={ForgotPasswordImage}
            alt="Forgot password"
          />
        </div>
        <p className="text-xl font-bold">Password reset confirmation</p>

        <p className="text-center font-medium">
          Your password has been successfully reset. Please check your email for
          the new password.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
