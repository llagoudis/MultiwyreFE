import Link from "next/link";
import React, { Fragment, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";
import { type DropDownOptionsType } from "~/types/Common";
import { Autocomplete, Dialog, TextField } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import ca from "~/assets/countryCodes/ca.svg";
import Close from "~/assets/general/close.svg";
import {
  isTermsAndConditionsTitle,
  TERMS_AND_CONDITIONS_URL,
} from "~/common/legal";

interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  countryCode: string;
  mobileNumber: string;
  password: string;
  reEnterPassword: string;
  checkbox?: string;
}

interface SignupFormProps {
  setData: (data: FormData) => void;
  data: FormData;
  loading: boolean;
  countryList: DropDownOptionsType[];
  legalDocument: LegalDocuments[];
}
const SignupForm: React.FC<SignupFormProps> = ({
  setData,
  loading,
  countryList,
  legalDocument,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      countryCode: "1",
    },
  });

  const [open, setOpen] = useState<string>("");
  const [selectedLegalDocument, setSelectedLegalDocument] =
    useState<LegalDocuments | null>(null);

  const onSubmit = (data: FormData) => {
    setData(data);
  };
  const countryId = watch("countryCode");
  const password = watch("password");
  const countryValue = countryList?.find(
    (item) => Number(item.value) === Number(countryId),
  ) ?? {
    flag: ca,
    label: "+1",
    value: 1,
  };

  const renderSections = (content: string) => {
    const sections = content.split(/<\/?h[1-6]>/g);

    return sections.map((section, index) => (
      <div key={index}>
        {section.startsWith("<h") ? (
          <h2
            className="my-4 text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ) : (
          <p dangerouslySetInnerHTML={{ __html: section }} />
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 flex h-screen w-full items-center justify-center overflow-y-auto bg-black">
      <Dialog
        fullScreen
        open={open === "legalDocPopup"}
        onClose={() => {
          setOpen("");
          setSelectedLegalDocument(null);
        }}
      >
        <div className="">
          <div className=" m-auto w-[90%]">
            <div className="mt-8 flex justify-between pb-4">
              <p className=" m-auto text-sm font-bold sm:text-base lg:text-lg">
                {selectedLegalDocument?.PolicyDocumentType?.displayName}
              </p>
              <button
                onClick={() => {
                  setOpen("");
                }}
              >
                <div>
                  <Image src={Close as StaticImageData} alt="Close" />
                </div>
              </button>
            </div>
            <div className="">
              <div className=" flex flex-col justify-between py-4 text-xs sm:text-sm lg:text-base">
                {/* ================================== */}
                {selectedLegalDocument ? (
                  <div>
                    <p className="my-4 text-xl font-semibold">
                      {selectedLegalDocument.title}
                    </p>
                    {renderSections(selectedLegalDocument.documentText)}
                  </div>
                ) : null}

                {/* =================================== */}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      <div className="   rounded-md bg-white p-10">
        <p className="text-xl font-bold"> Signup</p>
        <div className=" mt-4 font-medium">
          <p>Enter basic details</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" mt-4 flex flex-col ">
              <ExchangeInput
                control={control}
                label="First name"
                placeholder="Enter your first name"
                name="firstName"
                rules={{
                  required: "First name is required",
                  validate: (value: string) =>
                    value.trim() !== "" || "This field cannot be blank",
                }}
                type="text"
              />
              <ExchangeInput
                control={control}
                label="Last name"
                placeholder="Enter your last name"
                name="lastName"
                rules={{
                  required: "First name is required",
                  validate: (value: string) =>
                    value.trim() !== "" || "This field cannot be blank",
                }}
                type="text"
              />
              <div className=" grid grid-cols-1 gap-4 sm:flex-row md:grid-cols-2">
                <ExchangeInput
                  control={control}
                  label="Date of birth"
                  name="dob"
                  rules={{ required: "Date of birth is required" }}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                />
                <div className="mt-4">
                  <label htmlFor="mobileNumber" className="mb-0 block ">
                    Mobile number
                  </label>
                  <div className="flex items-center  ">
                    <div style={{ height: "100%" }}>
                      <Controller
                        control={control}
                        name="countryCode"
                        rules={{
                          required: "Please select an asset",
                        }}
                        render={({
                          field: { value, onChange },
                          fieldState: { error },
                        }) => (
                          <Fragment>
                            <Autocomplete
                              size="small"
                              className="w-[150px]"
                              options={countryList}
                              onChange={(_, nextValue) => {
                                onChange(nextValue?.value ?? "");
                              }}
                              disableClearable
                              value={countryValue ? countryValue : undefined}
                              renderOption={(props, option) => (
                                <li
                                  {...props}
                                  className="flex cursor-pointer items-center gap-2 p-2"
                                >
                                  <Image
                                    src={option.flag ?? ""}
                                    alt={option.label}
                                    width={30}
                                    height={30}
                                  />
                                  {option.label}
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  className=" flex items-center gap-2  "
                                  {...params}
                                  placeholder="Country "
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (() => {
                                      return (
                                        <Fragment>
                                          {countryValue?.label && (
                                            <Image
                                              className="ml-2 h-5 w-4"
                                              src={countryValue?.flag ?? ""}
                                              alt={countryValue?.label ?? ""}
                                              width={30}
                                              height={30}
                                            />
                                          )}
                                        </Fragment>
                                      );
                                    })(),
                                  }}
                                  variant="outlined"
                                />
                              )}
                            />
                            <p className="text-sm text-red-500">
                              {error?.message}
                            </p>
                          </Fragment>
                        )}
                      />
                    </div>
                    <div className="rounded border border-[#c4c4c4]">
                      <Controller
                        name="mobileNumber"
                        control={control}
                        rules={{
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]*$/,
                            message:
                              "Mobile number should contain only numbers",
                          },
                          minLength: {
                            value: 3,
                            message:
                              "Mobile number should contain only 10 digits",
                          },
                        }}
                        render={({ field }) => (
                          <div className="w-1/2">
                            <input
                              id="mobileNumber"
                              className="rounded-md  px-4 py-2  outline-none placeholder:text-sm placeholder:font-normal"
                              {...field}
                              value={field.value || ""}
                              placeholder="9999 999 999"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-red-500">
                    {errors?.mobileNumber?.message}
                  </p>
                </div>
              </div>

              <div className=" grid grid-cols-1 gap-4 sm:flex-row md:grid-cols-2">
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
              </div>
              <div className="mt-4">
                <Controller
                  name="checkbox"
                  control={control}
                  rules={{
                    required:
                      "You must agree to terms and conditions and privacy policy",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <label className="flex cursor-pointer items-center gap-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            {...field}
                            value={field.value ?? ""}
                            className="mt-[5px] cursor-pointer"
                          />
                          <div className="flex flex-wrap items-center text-xs md:text-sm">
                            <span className="mr-1">I agree to the</span>{" "}
                            {legalDocument
                              .sort((a, b) => {
                                if (
                                  a?.title === "Terms and conditions" ||
                                  a?.title === "Terms & Conditions"
                                )
                                  return -1;
                                if (
                                  b?.title === "Terms and conditions" ||
                                  b?.title === "Terms & conditions"
                                )
                                  return 1;
                                return 0;
                              })
                              .map((item, i) => (
                                <span key={i}>
                                  {isTermsAndConditionsTitle(item?.title) ? (
                                    <Link
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      href={TERMS_AND_CONDITIONS_URL}
                                      className=" text-xs font-semibold text-[#C1922E] md:text-sm"
                                    >
                                      {item?.title}
                                    </Link>
                                  ) : item?.documentText === " " ? (
                                    <span
                                      onClick={() => {
                                        setSelectedLegalDocument(item);
                                        setOpen("legalDocPopup");
                                      }}
                                      className=" cursor-pointer text-xs text-[#C1922E] md:text-sm"
                                    >
                                      {item?.title}
                                    </span>
                                  ) : (
                                    <Link
                                      target="_blank"
                                      href={item?.documentLink}
                                      className=" text-xs font-semibold text-[#C1922E] md:text-sm"
                                    >
                                      {item?.title}
                                    </Link>
                                  )}
                                  <span className="mr-1 text-xs font-semibold text-[#C1922E] md:text-sm">
                                    {i < legalDocument.length - 2 && ","}
                                    {i === legalDocument.length - 2 && " & "}
                                  </span>
                                </span>
                              ))}
                          </div>
                        </div>
                      </label>
                      <p className="mt-4 text-xs text-red-500">
                        {error?.message}
                      </p>
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p>
                  Already registered?{" "}
                  <Link
                    className=" font-semibold text-[#217EFD]"
                    href="/auth/login"
                  >
                    Login
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

export default SignupForm;
