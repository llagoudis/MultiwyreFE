import verification from "../../assets/general/verification.svg";
import Image, { type StaticImageData } from "next/image";

interface WarningMsgProps {
  message?: string;
  handleClick?: () => void;
  element?: any;
  handleClickText?: string;
}

type imageType = StaticImageData;

const WarningMsg: React.FC<WarningMsgProps> = ({
  message,
  handleClick,
  element,
  handleClickText,
}) => {
  return (
    <div className="idVerification flex gap-2 bg-blue-50 p-4 shadow sm:px-10 sm:py-6 md:px-10 border border-blue-200 text-blue-800">
      <Image alt="" src={verification as imageType} />

      <p className="text-sm md:text-base">{message ?? element}</p>
      {handleClick && (
        <button
          className=" text-sm font-bold text-[#217EFD] md:text-base"
          onClick={handleClick}
        >
          {handleClickText ?? "Verify Now"}
        </button>
      )}
    </div>
  );
};

export default WarningMsg;
