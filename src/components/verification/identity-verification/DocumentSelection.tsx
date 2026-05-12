import Button from "../../common/Button";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import CloseBtn from "~/assets/general/close.svg";
import Image, { type StaticImageData } from "next/image";
import verification from "../../../assets/general/verification.svg";
import ExchangeDropdown from "../../common/ExchangeDropdown";

interface DocumentSelectionProps {
  close: () => void;
  submitDocSelection: (data2: Form) => void;
  data: Form;
  countryList: Country[];
}

interface Form {
  countryOfIssue: string;
  documentType: string;
}

const idTypes = [
  { label: "ID Card", value: "IDCard" },
  { label: "Passport", value: "Passport" },
  { label: "Driver's License", value: "DrivingLicense" },
  { label: "Residence Permit", value: "ResidencePermit" },
];

const DocumentSelection: React.FC<DocumentSelectionProps> = ({
  close,
  submitDocSelection,
  data,
  countryList,
}) => {
  const { handleSubmit, control, reset, watch } = useForm<Form>();

  const onSubmit = (data: any) => {
    const { countryOfIssue, documentType } = data;
    const newData = {
      documentType: documentType.replace(/\s/g, ""),
      countryOfIssue,
    };
    submitDocSelection(newData);
  };

  useEffect(() => {
    reset(data);
  }, []);

  return (
    <div>
      <div className="flex items-center ">
        <div className="text-2xl font-bold">Verify your Identity</div>
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
            responsible for issues from others ID&apos;s. Choose a different ID
            type if you&apos;ve previously verified an account
          </span>
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <ExchangeDropdown
            label="Country of issue"
            name="countryOfIssue"
            control={control}
            valueKey="id"
            labelKey="name"
            rules={{
              required: "Select country",
            }}
            options={countryList}
            value={data.countryOfIssue}
            placeholder="Choose country"
          />
          <ExchangeDropdown
            label="Select an identity document type"
            name="documentType"
            control={control}
            rules={{
              required: "Select document type",
            }}
            options={idTypes}
            placeholder="Choose document"
            value={data.documentType}
          />
          <div className=" flex">
            <button type="button" className="font-semibold" onClick={close}>
              Cancel
            </button>
            <Button
              type="submit"
              className="ml-auto px-10 py-3"
              title="Continue"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DocumentSelection;
