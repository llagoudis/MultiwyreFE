import Button from "../../common/Button";
import ExchangeInput from "../../common/ExchangeInput";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import CloseBtn from "~/assets/general/close.svg";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { getLegalDocuments } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { Dialog } from "@mui/material";
import {
  isTermsAndConditionsTitle,
  TERMS_AND_CONDITIONS_URL,
} from "~/common/legal";

interface VerifyEmailProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
  companyEmail: string;
  onEmailSubmit: (companyEmail: string, hitAPI?: boolean) => void;
  loading: boolean;
}

interface Form {
  companyEmail: string;
  checkbox: string;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({
  close,
  companyEmail,
  onEmailSubmit,
  handleChangeScreen,
  loading,
}) => {
  const { handleSubmit, control, watch, reset } = useForm<Form>();
  const [legalDocuments, setLegalDocuments] = useState<LegalDocuments[]>([]);
  const [open, setOpen] = useState<string>("");
  const [selectedLegalDocument, setSelectedLegalDocument] =
    useState<LegalDocuments | null>(null);

  const getDocumentList = async () => {
    const [data] = await ApiHandler(getLegalDocuments);

    if (data?.success) {
      const docValue = data.body as LegalDocuments[];
      setLegalDocuments(docValue);
    }
    return [];
  };

  useEffect(() => {
    getDocumentList();
  }, []);
  const onSubmit = (data: any) => {
    onEmailSubmit(data.companyEmail);
  };

  useEffect(() => {
    companyEmail && reset({ companyEmail });
  }, [companyEmail]);

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
    <div>
      <div className="mb-2 flex items-center ">
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
                    <Image src={CloseBtn as StaticImageData} alt="Close" />
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
        <div className="text-2xl font-bold">Company Profile creation</div>
        <button className="ml-auto" onClick={close}>
          <Image
            className="scale-125 cursor-pointer"
            src={CloseBtn as StaticImageData}
            alt="close"
          />
        </button>
      </div>
      <p className="my-6 font-semibold">Create entity account</p>
      <form>
        <div className="mb-4">
          <ExchangeInput
            control={control}
            label="Enter Email"
            name="companyEmail"
            type="text"
            placeholder="Somebody@somemail.com"
            rules={{
              required: "Email is required",
              validate: (value: string) => {
                const emailPattern =
                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                if (!emailPattern.test(value)) {
                  return "Invalid companyEmail address";
                }
                return true; // Return true to indicate the validation passed
              },
            }}
          />
        </div>
        <div className="flex gap-2">
          <label className="flex">
            {/* <ExchangeInput
              name="checkbox"
              type="checkbox"
              control={control}
              label=""
              rules={{
                required: "Checkbox is required",
              }}
            /> */}

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
                        {legalDocuments
                          .sort((a, b) => {
                            if (a?.title === "Terms and conditions") return -1;
                            if (b?.title === "Terms and conditions") return 1;
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
                                {i < legalDocuments.length - 2 && ","}
                                {i === legalDocuments.length - 2 && " & "}
                              </span>
                            </span>
                          ))}
                      </div>
                    </div>
                  </label>
                  <p className="mt-4 text-xs text-red-500">{error?.message}</p>
                </div>
              )}
            />
          </label>
        </div>

        {/* ==================== */}
        <div className="mt-4 flex">
          <button
            type="button"
            className="font-bold"
            onClick={() => {
              onEmailSubmit(watch().companyEmail, false);
              handleChangeScreen("profileCreation");
            }}
          >
            Back
          </button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="ml-auto px-10 py-3"
            title="Next"
            type="submit"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default VerifyEmail;
