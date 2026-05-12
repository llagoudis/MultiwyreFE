import React, { useEffect } from "react";
import question from "../../../assets/general/question.svg";
import Image, { type StaticImageData } from "next/image";
import ExchangeDropdown from "../../common/ExchangeDropdown";
import { useForm } from "react-hook-form";
import Button from "../../common/Button";
import { Tooltip } from "@mui/material";

interface Form {
  incomingPayments?: string;
  outgoingPayments?: string;
  frequency?: string;
  expectedMonthlyRemittanceVolume?: string;
  paymentFromCountry1?: string;
  paymentFromCountry2?: string;
  paymentFromCountry3?: string;
  paymentToCountry1?: string;
  paymentToCountry2?: string;
  paymentToCountry3?: string;
}
interface CompanyInformationProps {
  submitPaymentInfo: (data: Form) => void;
  data: Form;
  countryOptions: Country[];
  paymentOptions: GenericMasterType[];
  frequencyOptions: GenericMasterType[];
  remittanceOptions: GenericMasterType[];
  close: () => void;
}

const CompanyInformation: React.FC<CompanyInformationProps> = ({
  data,
  submitPaymentInfo,
  countryOptions,
  paymentOptions,
  frequencyOptions,
  remittanceOptions,
  close,
}) => {
  const { handleSubmit, control, reset } = useForm();

  const onSubmit = (data: any) => {
    submitPaymentInfo(data);
  };

  useEffect(() => {
    reset(data);
  }, [data]);

  return (
    <div className="flex flex-col gap-6 px-5 font-medium text-black">
      <p className="text-2xl font-bold">Company Information</p>

      <div className="flex items-center gap-2">
        <p className="font-bold"> Payment types </p>

        <Tooltip
          title="Select the payment types you will use us for and the volume/frequency of paymnets per month. C2B (Customer to Business Incoming), B2B(Business to Business - Incoming/Outgoing), or B2C (Business to Customer Outgoing)."
          className="cursor-pointer"
          arrow
        >
          <Image src={question as StaticImageData} alt="" />
        </Tooltip>
      </div>

      <div className="flex flex-col text-sm font-normal">
        <ExchangeDropdown
          placeholder="Choose from below"
          options={paymentOptions}
          label="Incoming payments"
          name="incomingPayments"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.incomingPayments}
          rules={{
            required: "Select Incoming payments",
          }}
        />

        <ExchangeDropdown
          placeholder="Choose from below"
          options={paymentOptions}
          label="Outgoing payments"
          name="outgoingPayments"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.outgoingPayments}
          rules={{
            required: "Select Outgoing payments",
          }}
        />
        <ExchangeDropdown
          placeholder="Choose from below"
          options={frequencyOptions}
          label="Frequency"
          name="frequency"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.frequency}
          rules={{
            required: "Select Frequency",
          }}
        />
        <ExchangeDropdown
          placeholder="Choose from below"
          options={remittanceOptions}
          label="Expected monthly remittance volume"
          name="expectedMonthlyRemittanceVolume"
          control={control}
          valueKey="id"
          value={data.expectedMonthlyRemittanceVolume}
          rules={{
            required: "Select Expected monthly remittance volume",
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <p className="font-bold"> Payment from </p>

        <Tooltip
          className="cursor-pointer"
          title="Most common country/countries that you will be receiving/sending funds from"
          arrow
        >
          <Image src={question as StaticImageData} alt="" />
        </Tooltip>
      </div>
      <div className="flex flex-col text-sm font-normal">
        <ExchangeDropdown
          placeholder="Choose Country"
          options={countryOptions}
          label="Choose Country"
          name="paymentFromCountry1"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.paymentFromCountry1}
          rules={{
            required: "Select Country",
          }}
        />

        <ExchangeDropdown
          placeholder="Choose Country"
          options={countryOptions}
          label="Choose Country"
          name="paymentFromCountry2"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.paymentFromCountry2}
          rules={{
            required: "Select Country",
          }}
        />

        <ExchangeDropdown
          placeholder="Choose Country"
          options={countryOptions}
          label="Choose Country"
          name="paymentFromCountry3"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.paymentFromCountry3}
          rules={{
            required: "Select Country",
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <p className="font-bold"> Payment to </p>

        <Tooltip
          className="cursor-pointer"
          title="Most common country/countries that you will be receiving/sending funds from"
          arrow
        >
          <Image src={question as StaticImageData} alt="" />
        </Tooltip>
      </div>
      <div className="flex flex-col text-sm font-normal">
        <ExchangeDropdown
          placeholder="Choose Country"
          options={countryOptions}
          label="Choose Country"
          name="paymentToCountry1"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.paymentToCountry1}
          rules={{
            required: "Select Country",
          }}
        />

        <ExchangeDropdown
          placeholder="Choose Country"
          options={countryOptions}
          label="Choose Country"
          name="paymentToCountry2"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.paymentToCountry2}
          rules={{
            required: "Select Country",
          }}
        />

        <ExchangeDropdown
          placeholder="Choose Country"
          options={countryOptions}
          label="Choose Country"
          name="paymentToCountry3"
          control={control}
          valueKey="id"
          labelKey="name"
          value={data.paymentFromCountry3}
          rules={{
            required: "Select Country",
          }}
        />
      </div>

      <div className=" flex">
        <button className="font-bold" onClick={close}>
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

export default CompanyInformation;
