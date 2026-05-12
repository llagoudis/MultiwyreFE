import React from "react";
import CloseBtn from "~/assets/general/close.svg";
import Button from "../../common/Button";
import successful from "../../../assets/general/successful.svg";
import Image, { type StaticImageData } from "next/image";

interface SuccessProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
}

const SuccessMessage: React.FC<SuccessProps> = ({ close }) => {
  return (
    <>
      <div className="mt-6 flex justify-between">
        <Image
          alt="Success"
          src={successful as StaticImageData}
          className="m-auto h-32 w-32"
        />
        <button className="absolute right-[2.5rem] top-[3rem] " onClick={close}>
          <Image
            className="scale-125 cursor-pointer"
            src={CloseBtn as StaticImageData}
            alt="close"
            onClick={close}
          />
        </button>
      </div>
      <p className="mt-4 text-center text-2xl font-bold">
        Identity verification successful
      </p>
      <div className="text-md mt-4 text-center font-semibold">
        Your Identity verification process successfully completed
      </div>

      <div className="mt-10 flex">
        <button className="font-bold" onClick={close}>
          Close
        </button>
        <Button onClick={close} className="ml-auto px-10 py-3" title="Next" />
      </div>
    </>
  );
};

export default SuccessMessage;
