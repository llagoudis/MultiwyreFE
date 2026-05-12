import Button from "../../common/Button";
import CloseBtn from "~/assets/general/close.svg";
import Image, { type StaticImageData } from "next/image";
import DropZone from "../../common/DropZone";
import { useForm } from "react-hook-form";
import ExchangeInput from "../../common/ExchangeInput";
import ExchangeDropdown from "../../common/ExchangeDropdown";
import { useState } from "react";

const guideLines = [
  "Utility bills, e.g., electricity, water, gas, sewerage",
  "Internet service provider account statements",
  "Landline telephone/Internet/TV/communication packages bills (mobile bills are not acceptable)*",
  "Letters from Tax/Government Authority (tax statements may go beyond three months, within the past year)*",
  "Certificate of residence from local government (within three months, unless stated otherwise)",
];

interface VerifyAddressProps {
  close: () => void;
  submitAddress: (data: Form, file: any) => void;
  loading: boolean;
  countryList: Country[];
}

interface Form {
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  state: string;
}

const VerifyAddress: React.FC<VerifyAddressProps> = ({
  close,
  submitAddress,
  loading,
  countryList,
}) => {
  const [file, setFile] = useState<any>();
  const [fileError, setFileError] = useState<any>();
  const onSubmit = (data: Form) => {
    if (file) {
      setFileError("");
      submitAddress(data, file);
    } else {
      setFileError("Please upload a document");
    }
  };

  const { handleSubmit, control } = useForm<Form>();

  return (
    <div>
      <div className=" flex items-center">
        <p className="text-2xl font-bold">Verify your address</p>
        <button className="ml-auto" onClick={close}>
          <Image
            className="scale-125 cursor-pointer"
            src={CloseBtn as StaticImageData}
            alt="close"
          />
        </button>
      </div>

      <div className="my-6 font-semibold">Enter your address details</div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col">
          <ExchangeDropdown
            label="Country"
            name="country"
            control={control}
            labelKey="name"
            valueKey="id"
            rules={{
              required: "Select country",
            }}
            options={countryList}
            placeholder="Choose country"
          />

          <ExchangeInput
            control={control}
            label="City"
            name="city"
            rules={{
              required: "Select city",
            }}
            type="text"
            placeholder="Enter city"
          />

          <ExchangeInput
            control={control}
            label="Street"
            name="street"
            rules={{
              required: "Street is required",
            }}
            type="text"
            placeholder="Enter street name"
          />
          <ExchangeInput
            control={control}
            label="House number"
            name="houseNumber"
            rules={{
              required: "Street is required",
            }}
            type="text"
            placeholder="Enter house number"
          />
          <ExchangeInput
            control={control}
            label="Postal code zip"
            name="postalCode"
            rules={{
              required: "Postal code is required",
            }}
            type="text"
            placeholder="Enter postal zip code"
          />
          <ExchangeInput
            control={control}
            label="State or province"
            name="state"
            type="text"
            placeholder="State or province"
          />
        </div>
      </form>

      <DropZone
        submitFile={(fileDetails: any) => setFile(fileDetails)}
        setFileError={() => setFileError("")}
      />
      <span className="text-sm text-red-500">{fileError}</span>
      <div className="mb-2 mt-6 text-lg font-bold">
        Guidelines for proof of address
      </div>
      <div>
        Guidelines : Valid documents include,
        <br /> but are not limited to:
      </div>
      <div className="mt-4">
        {guideLines.map((value: string) => {
          return (
            <div key={value} className="mt-2 flex items-start gap-2">
              <div className="mt-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                >
                  <circle cx="7.5" cy="7.5" r="7.5" fill="#C1922E" />
                  <circle cx="7.5" cy="7.5" r="4.5" fill="white" />
                </svg>
              </div>
              <div>{value}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 flex">
        <button type="button" className="font-semibold" onClick={close}>
          Cancel
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

export default VerifyAddress;
