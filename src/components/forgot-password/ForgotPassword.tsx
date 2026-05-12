import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";

interface FormData {
  email: string;
  // password: string;
  // reEnterPassword: string;
}

interface ForgotPasswordFormProps {
  setData: (data: FormData) => void;
  data: FormData;
  loading: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  setData,
  loading,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    // watch,
  } = useForm<FormData>({});

  const onSubmit = (data: FormData) => {
    setData(data);
    console.log("Data:", data);
  };

  // const password = watch("password");

  return (
    <div className="fixed inset-0 flex h-screen w-full items-center justify-center overflow-y-auto bg-black">
      <div className="rounded-md bg-white p-10">
        <p className="text-xl font-bold"> Forgot Password</p>
        <div className=" mt-4 font-medium">
          <p>Enter basic details</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" mt-2 flex flex-col ">
              <ExchangeInput
                control={control}
                label="Email"
                placeholder="Enter your E-mail ID"
                name="email"
                rules={{
                  required: "Email is required",
                  validate: (value: string) =>
                    value.trim() !== "" || "This field cannot be blank",
                }}
                type="text"
              />
              {/* <div className=" grid grid-cols-1 gap-4 sm:flex-row">
                <div>
                  <ExchangeInput
                    control={control}
                    label="Enter password"
                    name="password"
                    rules={{
                      required: "Password is required",
                      validate: (value: string) => {
                        const hasSmallLetter = /[a-z]/.test(value);
                        const hasCapitalLetter = /[A-Z]/.test(value);
                        const hasNumber = /\d/.test(value);
                        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                        return (
                          (value.length >= 6 &&
                            hasSmallLetter &&
                            hasCapitalLetter &&
                            hasNumber &&
                            hasSymbol) ||
                          "Password should meet the specified criteria"
                        );
                      },
                    }}
                    type="password"
                    placeholder="**************"
                  />
                  <p className=" break-all text-xs font-normal text-gray-400">
                    <span className=" font-bold">Password Criteria:</span>{" "}
                    Should contain at least one Capital Letter,
                    <br /> one Small Letter, one Number & one Symbol
                  </p>
                </div>
                <ExchangeInput
                  control={control}
                  label="Re-enter password"
                  name="reEnterPassword"
                  rules={{
                    required: "Please re-enter your password",
                    validate: (value: string) =>
                      value === password || "Passwords do not match",
                  }}
                  type="password"
                  placeholder="**************"
                />
              </div> */}

              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p>
                  Don&#39;t have account?{" "}
                  <Link
                    className=" font-semibold text-[#217EFD]"
                    href="/auth/signup"
                  >
                    Signup
                  </Link>{" "}
                </p>

                <Button
                  loading={loading}
                  title="Continue"
                  type="submit"
                  className="px-14 py-3"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
