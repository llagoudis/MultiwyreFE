import Image, { type StaticImageData } from "next/image";
import Verification from "../../../assets/images/Verification.svg";
import Button from "../../common/Button";

interface VerifyNowProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
}

const VerifyNow: React.FC<VerifyNowProps> = ({ close, handleChangeScreen }) => {
  return (
    <div className=" ">
      <Image
        className="h-90 w-90 text-center"
        alt="Verification"
        src={Verification as StaticImageData}
      />

      <div className="mt-6 text-2xl font-bold">Verify your identity</div>

      <div className="mt-4 text-base font-normal">
        Please submit your documents to verify your identity Verifying your
        identity allows you to use our features and verification takes only few
        minutes
      </div>

      <div className="mt-8 flex">
        <button className="font-bold" onClick={close}>
          Cancel
        </button>
        <Button
          className="ml-auto px-10 py-3"
          title="Continue"
          onClick={() => handleChangeScreen("verifyEmailScreen")}
        />
      </div>
    </div>
  );
};

export default VerifyNow;
