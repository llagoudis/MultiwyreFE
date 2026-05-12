import Button from "../../common/Button";
import CloseBtn from "~/assets/general/close.svg";
import Image, { type StaticImageData } from "next/image";
import verification from "../../../assets/general/verification.svg";
import DropZone from "../../common/DropZone";
import { useState } from "react";

interface VerifyEmailProps {
  close: () => void;
  submitDocUpload: (base64: string) => void;
  handleChangeScreen: (screen: string) => void;
  loading: boolean;
}

const DocumentUpload: React.FC<VerifyEmailProps> = ({
  close,
  submitDocUpload,
  handleChangeScreen,
  loading,
}) => {
  const [file, setFile] = useState<any>();
  const [fileError, setFileError] = useState<any>();
  const onSubmit = () => {
    if (file) {
      submitDocUpload(file);
    } else {
      setFileError("Please upload a document");
    }
  };

  return (
    <div>
      <div className=" flex items-center">
        <div className="text-2xl font-bold">Verify your identity</div>
        <button className="ml-auto" onClick={close}>
          <Image
            className="scale-125 cursor-pointer"
            src={CloseBtn as StaticImageData}
            alt="close"
          />
        </button>
      </div>

      <div className="my-8 rounded-lg bg-[#F4DEB175] px-8 py-6 font-medium text-black">
        <p className="inline-block  gap-1 text-sm">
          <span className=" inline-block h-5">
            <Image
              alt="warning"
              src={verification as StaticImageData}
              className=" mr-1 mt-1 h-5 w-5"
            />
          </span>
          <span>
            Use your own ID documents for verification. Our company is not
            responsible for issues from others ID’s. Choose a different ID type
            if you’ve previously verified an account
          </span>
        </p>
      </div>

      <DropZone
        submitFile={(file: FormData) => setFile(file)}
        setFileError={() => setFileError("")}
      />
      <span className="text-sm text-red-500">{fileError}</span>

      <div className="mt-4">
        <div className="mb-4 text-xl font-bold">ID upload requirements</div>
        <ol type="1" className="list-decimal pl-4 font-semibold">
          <li>
            {/* Copies of original document or scanned copies or selfies are not
            acceptable */}
            Copies of original document or scanned copies are acceptable
          </li>
          <li className="mt-2">A valid government document</li>
        </ol>
      </div>
      <div className="mt-4 flex">
        <button
          className="font-bold"
          onClick={() => handleChangeScreen("documentSelection")}
        >
          Back
        </button>
        <Button
          onClick={onSubmit}
          className="ml-auto px-10 py-3"
          title="Next"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DocumentUpload;
