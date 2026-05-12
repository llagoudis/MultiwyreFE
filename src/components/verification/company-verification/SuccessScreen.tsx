import React from "react";
import Button from "../../common/Button";
import CloseBtn from "~/assets/general/close.svg";
import successful from "../../../assets/general/successful.svg";
import Image, { type StaticImageData } from "next/image";
import verification from "../../../assets/general/verification.svg";
interface SuccessProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
}

const SuccessMessage: React.FC<SuccessProps> = ({
  close,
  handleChangeScreen,
}) => {
  return (
    <div className="text-center">
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
      <div className="mt-6 text-2xl font-bold">
        Account created successfully
      </div>
      <div className="text-md mt-2 font-semibold">
        Your company profile is successfully created. Thank you for the
        patience.
      </div>

      <div className="mt-10 flex">
        <button className="font-bold" onClick={close}>
          Close
        </button>
        <Button
          onClick={() => handleChangeScreen("basicInformation")}
          className="ml-auto px-10 py-3"
          title="Next"
        />
      </div>
      <div className="mt-6">
        <div className="my-8 rounded-lg bg-[#F4DEB175] p-6 font-medium text-black">
          <p className="inline-block gap-1 text-start text-sm">
            <span className="inline-block h-5">
              <Image
                alt="warning"
                src={verification as StaticImageData}
                className=" mr-1 mt-1 h-5 w-5"
              />
            </span>
            <span>
              One last step, By clicking on next you will be taken to enter some
              basic entity information.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
