import React from "react";
import ExchangeInput from "../../common/ExchangeInput";
import { useForm } from "react-hook-form";
import ExchangeDropdown from "../../common/ExchangeDropdown";
import Button from "../../common/Button";
import { useEffect } from "react";

interface Form {
  companyName: string;
  companyLegalForm: string;
}

interface ProfileCreationProps {
  close: () => void;
  submitProfile: (data: Form) => void;
  data: Form;
  legalFormsList: GenericMasterType[];
}

const ProfileCreation: React.FC<ProfileCreationProps> = ({
  submitProfile,
  close,
  data,
  legalFormsList,
}) => {
  const { handleSubmit, control, reset } = useForm();

  const onSubmit = (data: any) => {
    submitProfile(data);
  };

  useEffect(() => {
    reset(data);
  }, [data]);

  return (
    <div>
      <div className="mb-2 flex items-center">
        <div className="text-2xl font-bold">Company Profile creation</div>
      </div>

      <p className=" font-semibold">Enter your entity information below</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-8">
          <ExchangeInput
            control={control}
            label="Entity Name"
            name="companyName"
            type="text"
            placeholder="Entity Name"
            rules={{
              required: "Please enter entity name",
            }}
          />
        </div>
        <div className="my-8">
          <ExchangeDropdown
            name="companyLegalForm"
            label="Legal form of your entity"
            control={control}
            options={legalFormsList}
            labelKey="name"
            valueKey="id"
            value={data.companyLegalForm}
            placeholder="Select document type"
            rules={{
              required: "Please select",
            }}
          />
        </div>
        <div className="mt-2 flex">
          <button type="button" className="font-bold" onClick={close}>
            Cancel
          </button>
          <Button type="submit" className="ml-auto px-10 py-3" title="Next" />
        </div>
      </form>
    </div>
  );
};

export default ProfileCreation;
