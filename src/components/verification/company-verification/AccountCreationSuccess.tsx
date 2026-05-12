import React, { useEffect, useState } from "react";
import successful from "../../../assets/general/successful.svg";
import Image, { type StaticImageData } from "next/image";
import Button from "../../common/Button";
import WarningMsg from "../../common/WarningMsg";
import { ApiHandler } from "~/service/UtilService";
import useGlobalStore from "~/store/useGlobalStore";

interface AccountCreationSuccessProps {
  close: () => void;
}

const AccountCreationSuccess: React.FC<AccountCreationSuccessProps> = ({
  close,
}) => {
  const admin = useGlobalStore((state) => state.admin);

  return (
    <div className="relative mb-6 flex flex-col gap-4 px-5 font-medium">
      <div className="relative flex justify-between">
        <Image
          alt="Success"
          src={successful as StaticImageData}
          className="m-auto h-32 w-32"
        />
      </div>
      <p className="text-center text-2xl font-bold">Application submitted</p>
      <p className="text-center">
        You have submitted your application successfully. We will notify you by
        email once we get the result. Thank you for your patience.
      </p>

      <WarningMsg
        message={`If you have any questions, please feel free to mail us at ${admin?.email}`}
      />

      <div className="mt-10 flex justify-center">
        <Button onClick={close} className="px-10 py-3" title="Submit" />
      </div>
    </div>
  );
};

export default AccountCreationSuccess;
