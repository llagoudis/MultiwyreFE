import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";
import Image from "next/image";
import twofa from "~/assets/images/TwoFA.png";

interface FormData {
  twoFactorCode: string;
}

interface TwoFactorAuthenticationProps {
  close: () => void;
  submitData: (data: FormData) => void;
  loading: boolean;
  twofaQR: string;
}

const TwoFactorAuthentication: React.FC<TwoFactorAuthenticationProps> = ({
  close,
  submitData,
  loading,
  twofaQR,
}) => {
  const { handleSubmit, control } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    submitData(data);
  };

  return (
    <Fragment>
      <h1 className="mb-2 text-xl font-bold">Authorise action with 2FA</h1>
      <hr />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10 flex">
          <div>
            <Image width="160" height="100" alt="" src={twofa} />
          </div>

          <div className="ml-6 flex-col items-center justify-center">
            <div className="flex justify-center">
              <Image height={150} width={150} alt="" src={twofaQR} />
            </div>
            <div className="mb-4">
              <ExchangeInput
                control={control}
                label={
                  <span>
                    Enter your
                    <span className={`text-[#C1922E]`}>2FA code</span> authorize
                    this action
                  </span>
                }
                name="twoFactorCode"
                type="text"
                rules={{
                  required: "Two-Factor code is required",
                }}
              />
            </div>
          </div>
        </div>
      </form>
      <div className="mt-10 flex">
        <div className="ml-auto">
          <button onClick={close}>Cancel</button>
          <Button
            className="ml-8 px-12 py-3"
            title="Continue"
            loading={loading}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default TwoFactorAuthentication;
