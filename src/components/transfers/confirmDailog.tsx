import { type FC } from "react";
import Image, { type StaticImageData } from "next/image";
import MuiButton from "~/components/MuiButton";
import Close from "~/assets/general/close.svg";

interface ConfirmTemplateProps {
  onClose: () => void;
  onConfirm: () => void;
  assetAddress?: string;
  label?: string;
  amount: {
    fee: number;
    withdrawal: number | string;
    net: number | string;
  };
}
const ConfirmDailog: FC<ConfirmTemplateProps> = ({
  onClose,
  onConfirm,
  assetAddress,
  label,
  amount,
}) => {
  return (
    <div>
      <div className="flex justify-between border-b-2 border-[#DFDDDD] pb-4">
        <p className=" text-sm font-bold sm:text-base lg:text-lg">
          Confirm your withdrawal
        </p>
        <button onClick={onClose}>
          <div>
            <Image src={Close as StaticImageData} alt="Close" />
          </div>
        </button>
      </div>
      <div className="">
        {label && (
          <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
            <p>Address label</p>
            <p>{label}</p>
          </div>
        )}
        <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
          <p>Destination address</p>
          <p>{assetAddress}</p>
        </div>
        <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
          <p>Withdrawal amount</p>
          <p>{amount.withdrawal ? amount.withdrawal : ""}</p>
        </div>
        <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
          <p>Fee amount</p>
          <p>{amount.fee ? amount.fee : ""} </p>
        </div>
        <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
          <p>Withdrawal net amount</p>
          <p>{amount.net ? amount.net : ""}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-6 ">
        <button className=" cursor-pointer text-sm font-bold" onClick={onClose}>
          Cancel
        </button>
        <MuiButton name={"Continue"} onClick={onConfirm} useLoading />
      </div>
    </div>
  );
};

export default ConfirmDailog;
