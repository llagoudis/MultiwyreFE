import React from "react";
import { useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";

interface FormData {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordProps {
  close: () => void;
  submitData: (data: FormData) => void;
  loading: boolean;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  close,
  submitData,
  loading,
}) => {
  const { handleSubmit, control, watch } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    submitData(data);
  };

  const password = watch("newPassword");

  return (
    <div>
      <h1 className="mb-1 w-3/4 text-xl font-bold">Change Password</h1>
      <p className="mb-10 font-medium text-gray-600">
        Enter your current and new password
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div>
            <ExchangeInput
              control={control}
              label="Current Password"
              name="currentPassword"
              type="password"
              rules={{
                required: "Current Password is required",
              }}
            />
          </div>
          <div>
            <ExchangeInput
              control={control}
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="**************"
              rules={{
                required: "New Password is required",
                validate: (value: string) =>
                  value.length >= 8 ||
                  "Password should be at least 8 characters long",
              }}
            />
            <ExchangeInput
              control={control}
              label="Re-enter Password"
              name="reEnterPassword"
              rules={{
                required: "Please re-enter your Password",
                validate: (value: string) =>
                  value === password || "Passwords do not match",
              }}
              type="password"
              placeholder="**************"
            />
          </div>
        </div>
        <div className="mt-10 flex">
          <button onClick={close}>Cancel</button>
          <Button
            className="ml-auto px-16 py-3"
            title="Submit"
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
