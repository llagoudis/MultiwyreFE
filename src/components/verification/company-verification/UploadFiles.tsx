import React, { useEffect, useState } from "react";
import question from "../../../assets/general/question.svg";
import Image, { type StaticImageData } from "next/image";
import upload_icon from "../../../assets/general/upload_icon.svg";
import Button from "../../common/Button";
import { Controller, useForm } from "react-hook-form";
import { RiDeleteBin6Line } from "react-icons/ri";
import successful from "~/assets/general/successful.svg";
import { Tooltip } from "@mui/material";

interface UploadFilesProps {
  handleChangeScreen: (screen: string) => void;
  submitFiles: (data: any, hitAPI?: boolean) => void;
  loading: boolean;
  data: any;
}

const fileData = [
  {
    label: "Certificate of formation",
    key: "cerificateOfFormation",
    tooltip:
      "Please provide the legal document which evidences the formation or registration of your legal entity",
  },
  {
    label:
      "Memorandum and Articles of Association / constitution/ LLC agreement",
    key: "companyAgreement",
    tooltip:
      "The document which governs and regulates the activities of the company. Outlines rules and procedures to govern the company. Please upload the latest and most up to date version of your operating agreement.",
  },
  {
    label: "Certificate of directors",
    key: "certificateOfDirectors",
    tooltip:
      "The document should be dated within the last 12 months and showing the managers/director of the applying entity. The document should be issued by a Government or Registry",
  },
  {
    label: "Certificate of shareholders",
    key: "certificateOfShareholders",
    tooltip:
      "The document should be dated within the last 12 months and showing the managers/director of the applying entity. The document should be issued by a Government or Registry",
  },
  {
    label: "Audited financial statement",
    key: "auditedFinancialStatement",
    tooltip: "Audited Financial Statements or Management Accounts",
  },
  {
    label: "Proof of address",
    key: "proofOfAddress",
    tooltip:
      "List of acceptable address verification documents which must be issued within the last 90 days : Bank statements (with transaction history) Utility bills (Please note that we DO NOT accept mobile phone bills and insurance letters) Government documents such as tax forms Valid tenancy agreement (signed and dated)",
  },
  {
    label: "Company structure",
    key: "companyStructure",
    tooltip: (
      <div>
        Is your company owned by any intermediary companies/legal arrangement
        &#40; at least 25% or more &#41;?
        <br />
        <br />
        Yes or No.
        <p>
          Upload the below documents of all intermediaries that meet the
          requirements:
        </p>
        <p>1. Certificate of Incorporation</p>
        <p>2. Memorandum & Articles of Association/Constitution/By-Laws</p>
        <p>
          3. Certificate of Incumbency/Register of Shareholders &#40; Members
          &#41; / Business Registry or equivalent &#40;with the Beneficial
          Owner&apos;s information&#41;
        </p>
        <p>
          4. Certificate of Good Standing/Certificate of Incumbency/Business
          Registry or equivalent &#40;with the current operating status &#41;
        </p>
      </div>
    ),
  },
  {
    label: "Source of funds",
    key: "sourceOfFunds",
    tooltip:
      "Acceptable Source of Funds: Latest financial statement (audited); Tax Return ( certified); Bank Letter or Bank Statements( certified); Brokers Statements for investment/shareholdings",
  },
  {
    label: "Supplement documents (optional)",
    key: "supplimentDocuments",
    tooltip:
      "Full description of the business such as: business organization structure, company's website, how many directly/indirectly owned companies are involved in the business, how customers are attracted etc",
  },
];

const ErrorMessage = ({ error }: { error: any }) => {
  return error ? <span className="text-xs text-red-500">{error}</span> : null;
};

const UploadFiles: React.FC<UploadFilesProps> = ({
  handleChangeScreen,
  submitFiles,
  loading,
  data,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors: errors },
    setValue,
    getValues,
    watch,
    clearErrors,
    reset,
  } = useForm();

  const onSubmit = (data: any) => {
    submitFiles(data);
  };

  const watchAllFields = watch();

  useEffect(() => {
    data && reset(data);
  }, [data]);

  // const [selectedFiles, setSelectedFiles] = useState([]);

  const [filesArray, setFilesArray] = useState<any>([]);

  const handleChange = (e: any, documentKey: string) => {
    if (documentKey === "supplimentDocuments") {
      const previousFiles = filesArray || [];

      const allFiles = [...previousFiles, ...Array.from(e.target.files)];

      setFilesArray(allFiles);

      allFiles.forEach((obj, index) => {
        setValue(documentKey + index, obj);
      });
    } else {
      setValue(documentKey, e?.target?.files[0]);
      clearErrors(documentKey);
    }
  };

  const handleDelete = (fieldKey: string, index: number, obj: any) => {
    const updatedFilesArray = filesArray.filter((item: any) => item !== obj[1]);
    setFilesArray(updatedFilesArray);
    setValue(fieldKey, "");
  };

  return (
    <div className="flex flex-col gap-8 px-5 font-medium text-black">
      <p className="text-2xl font-bold">Basic entity information</p>

      <p>
        Please answer a few questions to see what you need to prepare for your
        application
      </p>

      <div className="flex flex-col gap-4">
        {fileData.map((document: any, index: any) => (
          <div key={document.key} className="border-b-2 border-[#99B2C6] pb-2">
            <div className="flex items-center justify-between ">
              <div className="flex w-10/12 items-center gap-2">
                <p> {document.label}</p>

                <Tooltip
                  arrow
                  title={document.tooltip}
                  className="cursor-pointer"
                >
                  <Image src={question as StaticImageData} alt="" />
                </Tooltip>

                {watchAllFields[document.key]?.name && (
                  <>
                    <Image
                      alt="Success"
                      src={successful as StaticImageData}
                      className=" h-8 w-8"
                    />
                  </>
                )}

                {index === 8 && filesArray.length ? (
                  <>
                    <Image
                      alt="Success"
                      src={successful as StaticImageData}
                      className=" h-8 w-8"
                    />
                  </>
                ) : (
                  ""
                )}
              </div>
              <label className="relative cursor-pointer rounded py-2 pl-4 font-bold text-white ">
                <Controller
                  name={document.key}
                  control={control}
                  rules={{
                    required:
                      document.label !== "Supplement documents (optional)"
                        ? "Please upload this document"
                        : false,
                  }}
                  render={() => (
                    <div>
                      <input
                        onChange={(e: any) => {
                          //
                          handleChange(e, document.key);
                        }}
                        type="file"
                        accept=".pdf, .doc, .docx, .jpg, .jpeg"
                        className="absolute inset-0  cursor-pointer opacity-0"
                        multiple={document.key === "supplimentDocuments"}
                      />
                    </div>
                  )}
                />

                <Image src={upload_icon as StaticImageData} alt="" />
              </label>
            </div>
            <div>
              {watchAllFields[document.key]?.name && (
                <div className="mt-2 flex items-center">
                  <span className="mb-1 mr-2 text-gray-400">
                    {watchAllFields[document.key]?.name}
                  </span>{" "}
                  <button onClick={() => setValue(document.key, "")}>
                    <RiDeleteBin6Line />
                  </button>
                </div>
              )}
              {document.key === "supplimentDocuments" &&
                Object.entries(watchAllFields).map(
                  (obj: any, index: number) => {
                    if (
                      obj[0].includes("supplimentDocuments") &&
                      obj[1]?.name
                    ) {
                      return (
                        <div className="mt-2 flex items-center" key={index}>
                          <span className="mb-1 mr-2 text-gray-400">
                            {obj[1]?.name}
                          </span>{" "}
                          <button
                            onClick={() => handleDelete(obj[0], index, obj)}
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      );
                    }
                  },
                )}
            </div>
            <ErrorMessage error={errors[document.key]?.message} />
          </div>
        ))}
      </div>

      <div className="flex">
        <button
          className="font-bold"
          onClick={() => {
            submitFiles(watchAllFields, false);
            handleChangeScreen("paymentInformation");
          }}
        >
          Back
        </button>
        <Button
          onClick={handleSubmit(onSubmit)}
          className="ml-auto px-10 py-3"
          title="Next"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default UploadFiles;
