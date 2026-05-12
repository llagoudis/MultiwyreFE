import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import ExchangeDropdown from "../../common/ExchangeDropdown";
import ExchangeInput from "../../common/ExchangeInput";
import Button from "../../common/Button";

interface BasicInformationProps {
  handleChangeScreen: (screen: string) => void;
  submitBasicInfo: (data: Form, hitAPI?: boolean) => void;
  data: Form;
  countryOptions: Country[];
  loading: boolean;
}

interface Form {
  operatingJurisdiction: string;
  operatingAddressCity: string;
  operatingAddressAddressLine1: string;
  operatingAddressPostalCode: string;
  sameOperatingAddress: string;
}

const BasicInformation3: React.FC<BasicInformationProps> = ({
  handleChangeScreen,
  submitBasicInfo,
  data,
  countryOptions,
  loading,
}) => {
  const { handleSubmit, control, watch, reset, setValue } = useForm<Form>();

  const [checked, setChecked] = useState<string>("");
  const onSubmit = (data: Form) => {
    submitBasicInfo(data);
  };

  useEffect(() => {
    reset(data);
    setChecked(data.sameOperatingAddress || "yes");
  }, [data]);

  return (
    <div className="flex flex-col gap-6 px-5 font-medium text-black">
      <p className="text-2xl font-bold">Basic entity information</p>
      <p>
        Please answer a few questions to see what you need to prepare for your
        application
      </p>

      <p className="text-xl font-bold">Operating business address</p>

      <p>
        The operating business address is the same as the registered address
      </p>
      <div className="flex gap-20">
        <div className="flex items-center gap-3">
          <label htmlFor="yes">
            <input
              type="radio"
              onChange={() => {
                setValue("sameOperatingAddress", "yes");
                setChecked("yes");
              }}
              checked={checked === "yes"}
              id="yes"
              name="businessAddress"
            />
            Yes
          </label>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="no">
            <input
              onChange={() => {
                setValue("sameOperatingAddress", "no");
                setChecked("no");
              }}
              type="radio"
              id="no"
              name="businessAddress"
              checked={checked === "no"}
            />
            No
          </label>
        </div>
      </div>

      {checked === "no" && (
        <div>
          <ExchangeDropdown
            placeholder="Choose"
            options={countryOptions}
            label="Jurisdiction"
            name="operatingJurisdiction"
            control={control}
            valueKey="id"
            labelKey="name"
            value={data.operatingJurisdiction}
            rules={{
              required: "Select Jurisdiction",
            }}
          />

          <ExchangeInput
            control={control}
            label="City"
            name="operatingAddressCity"
            type="text"
            placeholder="Enter city"
            rules={{
              required: "Select City",
            }}
          />

          <ExchangeInput
            control={control}
            label="Street"
            name="operatingAddressAddressLine1"
            type="text"
            placeholder="Enter Street"
            rules={{
              required: "Enter Street",
            }}
          />
          <ExchangeInput
            control={control}
            label="Zip code"
            name="operatingAddressPostalCode"
            type="text"
            placeholder="Enter a zip code"
            rules={{
              required: "Enter a zip code",
            }}
          />
        </div>
      )}

      <div className="mt-8 flex">
        <button
          className="font-semibold"
          onClick={() => {
            submitBasicInfo(watch(), false);
            handleChangeScreen("basicInformation2");
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

export default BasicInformation3;
