import { useEffect } from "react";
import ExchangeDropdown from "../../common/ExchangeDropdown";
import { useForm } from "react-hook-form";
import ExchangeInput from "../../common/ExchangeInput";
import Button from "../../common/Button";

interface BasicInformationProps {
  handleChangeScreen: (screen: string) => void;
  submitBasicInfo: (data: Form) => void;
  data: Form;
  countryOptions: Country[];
}

interface Form {
  jurisdiction: string;
  city: string;
  addressLine1: string;
  postalCode: string;
}

const BasicInformation2: React.FC<BasicInformationProps> = ({
  handleChangeScreen,
  submitBasicInfo,
  data,
  countryOptions,
}) => {
  const { handleSubmit, control, watch, reset } = useForm<Form>();

  const onSubmit = (data: Form) => {
    submitBasicInfo(data);
  };

  useEffect(() => {
    reset(data);
  }, [data]);

  return (
    <div className="flex flex-col gap-6 px-5 text-black">
      <p className="text-2xl font-bold">Basic entity information</p>
      <p className=" font-medium">
        Please answer a few questions to see what you need to prepare for your
        application
      </p>

      <p className="text-xl font-bold">Registered Address</p>
      <div className="flex flex-col text-sm">
        <ExchangeDropdown
          placeholder="Choose"
          options={countryOptions}
          label="Jurisdiction"
          valueKey="id"
          labelKey="name"
          name="jurisdiction"
          control={control}
          value={data.jurisdiction}
          rules={{
            required: "Select Jurisdiction",
          }}
        />

        <ExchangeInput
          control={control}
          label="City"
          name="city"
          type="text"
          placeholder="Enter city"
          rules={{
            required: "Enter City",
          }}
        />

        <ExchangeInput
          control={control}
          label="Street"
          name="addressLine1"
          type="text"
          placeholder="Enter Street"
          rules={{
            required: "Enter Street",
          }}
        />
        <ExchangeInput
          control={control}
          label="Zip code"
          name="postalCode"
          type="text"
          placeholder="Enter a zip code"
          rules={{
            required: "Enter a zip code",
          }}
          
          
        />
      </div>

      <div className="flex">
        <button
          className="font-bold"
          onClick={() => {
            submitBasicInfo(watch());
            handleChangeScreen("basicInformation");
          }}
        >
          Back
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

export default BasicInformation2;
