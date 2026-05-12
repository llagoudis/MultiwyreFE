import { useDropzone } from "react-dropzone";
import File from "../../assets/general/file-icon.svg";
import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { RiDeleteBin6Line } from "react-icons/ri";
import toast from "react-hot-toast";

interface DropZoneProps {
  submitFile: (fileDetails: any) => void;
  setFileError?: () => void;
}

const DropZone: React.FC<DropZoneProps> = ({ submitFile, setFileError }) => {
  const [filename, setFileName] = useState<string>("");
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file: any = acceptedFiles[0];
      const allowedFileTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        // "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (allowedFileTypes.includes(file.type)) {
        setFileName(file.name);
        submitFile(file);
      } else {
        toast.error("File should be in PDF, Word, or Jpg");
      }
      setFileError && setFileError();
    },
  });

  return (
    <>
      <div
        {...getRootProps()}
        className="dropzone mt-4 rounded border-2 border-dashed border-gray-400 p-10"
      >
        <input {...getInputProps()} accept=".jpg" multiple={false} />
        <div className="text-center">
          <Image
            className="h-30 w-30 m-auto mb-2"
            alt="File"
            src={File as StaticImageData}
          />

          <p className=" font-semibold">Drag and drop files</p>

          <div className="text-sm text-gray-400">or</div>
          <button className=" text-xs font-bold text-blue-500">
            Add files
          </button>
        </div>
      </div>
      {filename && (
        <div className="mt-2 flex items-center justify-center">
          <span className="mb-1 mr-2">{filename}</span>{" "}
          <button
            onClick={() => {
              setFileName("");
              submitFile("");
            }}
          >
            <RiDeleteBin6Line />
          </button>
        </div>
      )}
    </>
  );
};

export default DropZone;
