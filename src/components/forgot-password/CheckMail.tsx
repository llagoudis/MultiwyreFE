import Image from "next/image";
import React from "react";
import ForgotPasswordImage from "~/assets/general/forgot-password.png";

const CheckMail = () => {
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
        <p className="text-xl font-bold">Check your inbox</p>

        <p className="text-center font-medium">
          We have sent you an email with the password reset instructions. Follow
          these instructions to create a new password
        </p>
      </div>
    </div>
  );
};

export default CheckMail;
