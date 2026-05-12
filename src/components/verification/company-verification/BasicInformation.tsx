import { useEffect } from "react";
import { useForm } from "react-hook-form";
import ExchangeDropdown from "../../common/ExchangeDropdown";
import ExchangeInput from "../../common/ExchangeInput";
import Button from "../../common/Button";

interface Profile {
  incorporationDate: string;
  country: string;
  natureOfBusiness: string;
  registrationNumber: string;
}

interface BasicInformationProps {
  submitBasicInfo: (data: Profile) => void;
  close: () => void;
  data: Profile;
  countryOptions: Country[];
  natureOfBusinessOptions: GenericMasterType[];
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  submitBasicInfo,
  close,
  data,
  countryOptions,
  natureOfBusinessOptions,
}) => {
  const { handleSubmit, control, reset } = useForm<Profile>();

  const onSubmit = (data: any) => {
    submitBasicInfo(data);
  };

  useEffect(() => {
    reset(data);
  }, []);

  natureOfBusinessOptions.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mb-4 flex flex-col gap-4 text-black">
      <p className="text-2xl font-bold">Basic entity information</p>

      <p className=" font-semibold">
        Please answer a few questions to see what you need to prepare for your
        application
      </p>
      <div className="flex flex-col text-sm">
        <ExchangeDropdown
          name="country"
          label="Which country is your entity registered?"
          control={control}
          options={countryOptions}
          labelKey="name"
          valueKey="id"
          value={data.country}
          placeholder="Choose Country"
          rules={{
            required: "Select country",
          }}
        />

        <ExchangeDropdown
          name="natureOfBusiness"
          label="What is the nature of the business?"
          control={control}
          options={natureOfBusinessOptions}
          labelKey="name"
          valueKey="id"
          value={data.natureOfBusiness}
          placeholder="Choose your business nature"
          rules={{
            required: "Select your business nature",
          }}
        />

        <ExchangeInput
          control={control}
          label="What is your registration number"
          name="registrationNumber"
          type="number"
          placeholder="Enter your registration number"
          rules={{
            required: "Enter your registration number",
          }}
        />
      </div>

      <p className=" font-semibold">
        Please input your company registration number. We may relay on this
        number to retrieve publicly available information about the company
      </p>

      <div className="text-sm">
        <ExchangeInput
          control={control}
          label="Date of incorporation"
          name="incorporationDate"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          rules={{
            required: "Select Date of incorporation",
          }}
        />
      </div>

      <div className=" flex">
        <button className="font-semibold" onClick={close}>
          Cancel
        </button>
        <Button
          onClick={handleSubmit(onSubmit)}
          className="ml-auto px-10 py-3"
          title="Next"
        />
      </div>
    </div>
  );
};

export default BasicInformation;
