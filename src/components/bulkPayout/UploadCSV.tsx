import { Autocomplete, Dialog, TextField } from "@mui/material";
import React, { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import MuiButton from "../MuiButton";
import Image, { type StaticImageData } from "next/image";
import uploadIcon from "../../assets/images/uploadIcon.svg";
import browswCSVIcon from "../../assets/images/browswCSVIcon.svg";
import closeIcon from "../../assets/images/close-circle.svg";
import close from "../../assets/images/close.svg";
import TransitionDialog from "../common/TransitionDialog";
import TwoFA from "../TwoFA";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import Button from "../common/Button";
import { createCSVTransafer } from "~/service/ApiRequests";

type balanceType = {
  requiredBalance: number;
  projectBalance: number;
  error: string;
};
const UploadCSV = () => {
  const assets = useAsyncMasterStore<"assets">("assets");

  const filteredAssets = assets.filter(
    (asset) => asset.fireblockAssetId !== "USD",
  );

  const csvInit: CSVForm = {
    assetId: "",
    csv: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,

    formState: { isSubmitting, errors },
  } = useForm<CSVForm>({
    defaultValues: csvInit,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onSubmit = (data: CSVForm) => {
    if (!selectedFile) {
      alert("Please select a CSV file.");
      return;
    }

    setPopupState("2FA");
  };

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file) setSelectedFile(file);
  };

  const assetId = watch("assetId");

  const assetValue = filteredAssets?.find(
    (item) => item.fireblockAssetId === assetId,
  );
  const [popupState, setPopupState] = useState<
    "CONFIRM" | "INSUFFICIANT_BALANCE" | "2FA" | ""
  >("");

  const [balanceError, setBalanceError] = useState<balanceType>();

  const on2FASubmit = async () => {
    const formData = new FormData();

    if (selectedFile) formData.append("file", selectedFile);
    formData.append("assetId", watch("assetId"));

    const [data, error] = await ApiHandler(createCSVTransafer, formData);
    console.log("data: ", data);

    if (data?.success == true) {
      toast.success("Transaction Submitted");
      setSelectedFile(null);
      setPopupState("");
      reset();
    }

    if (error) {
      try {
        const balanceerror: any = JSON.parse(error);

        if (balanceerror?.error === "INSUFFICIANT_BALANCE") {
          setPopupState(balanceerror.error);
          setBalanceError(balanceerror);
        }
      } catch (error) {
        //
      }
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="m-auto flex w-[50%] flex-col items-start gap-5 rounded-lg bg-white p-10 pt-2 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]"
      >
        <p className="font-semibold text-[#292D32]">Upload CSV</p>
        <hr className="h-2 w-full"></hr>
        <p>Choose Currency </p>
        <div className="w-full">
          <Controller
            control={control}
            name="assetId"
            rules={{
              required: "Please select an asset",
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Fragment>
                <Autocomplete
                  size="small"
                  options={filteredAssets}
                  onChange={(_, nextValue) => {
                    onChange(nextValue?.fireblockAssetId ?? "");
                  }}
                  value={assetValue ? assetValue : null}
                  getOptionLabel={(option) => {
                    return option.name ? option.name : value;
                  }}
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      className="flex cursor-pointer items-center gap-2 p-2"
                    >
                      <Image
                        src={option.icon ?? ""}
                        alt={option.name}
                        width={30}
                        height={30}
                      />
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      className=" flex items-center gap-2 bg-[#ffffff] "
                      {...params}
                      placeholder="Select currency"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (() => {
                          return (
                            <Fragment>
                              {assetValue && (
                                <Image
                                  className="ml-2 h-5 w-4"
                                  src={assetValue?.icon ?? ""}
                                  alt={assetValue?.name}
                                  width={80}
                                  height={80}
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
                <p className="text-sm text-red-500">{error?.message}</p>
              </Fragment>
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-5">
          <Image src={uploadIcon as StaticImageData} alt="Upload files" />

          <p className="flex flex-col">
            <span className="font-semibold text-[#292D32]">Upload files</span>

            <span className="text-[#A9ACB4]">
              Select and upload the files of your choice
            </span>
          </p>
        </div>

        <hr className="h-2 w-full"></hr>

        <div className=" m-auto  items-center">
          <label
            className={`m-auto flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 ${
              isDragActive ? "border-blue-500" : "border-gray-300"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Image src={browswCSVIcon as StaticImageData} alt="Browse files" />
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {selectedFile && (
            <div className="mt-10 w-full rounded-xl bg-[#F1F1F1] p-5">
              <p className="flex items-center justify-between font-semibold">
                <span>{selectedFile.name}</span>
                <Image
                  src={closeIcon as StaticImageData}
                  alt="Remove"
                  className="cursor-pointer"
                  onClick={() => setSelectedFile(null)}
                />
              </p>
              <p> {(selectedFile.size / 1024).toFixed(2)} KB</p>
              {/* <progress value="32" className="w-full" max="100">
              32%
            </progress> */}
            </div>
          )}
        </div>

        <p className="text-sm text-red-500">
          {!selectedFile && errors.csv?.message}
        </p>

        <div className="ml-auto block w-fit">
          <MuiButton
            name="Start Bulk Payout"
            type="submit"
            loading={isSubmitting}
          />
        </div>
      </form>

      <TransitionDialog
        open={popupState === "2FA"}
        onClose={() => setPopupState("")}
      >
        <TwoFA
          onClose={() => {
            setPopupState("");
          }}
          onSubmit={on2FASubmit}
        />
      </TransitionDialog>

      <Dialog
        open={popupState === "INSUFFICIANT_BALANCE"}
        onClose={() => {
          setPopupState("");
        }}
        maxWidth={"sm"}
        fullWidth
      >
        <div className="rounded p-10">
          <div className="flex items-start gap-6">
            <button
              className="rounded-lg bg-[#FFF3F3] px-2"
              onClick={() => setPopupState("")}
            >
              <Image
                src={close as StaticImageData}
                alt="Close"
                className="h-20 w-20"
              />
            </button>
            <div className="flex flex-col gap-10 text-lg">
              <p className="flex flex-col gap-2 ">
                <span className="text-[20px] font-bold">
                  Insufficient balance
                </span>
                <span className=" text-[#54595E99]">
                  It looks like your {assetId} is too low to complete this
                  transaction.
                </span>
              </p>

              <p className="flex flex-col">
                <span>
                  <span className="text-md  font-semibold">
                    Current Balance:{" "}
                  </span>{" "}
                  {balanceError?.projectBalance?.toFixed(4)} {watch("assetId")}
                </span>
                <span>
                  <span className="text-md  font-semibold">
                    Required Amount:{" "}
                  </span>
                  {balanceError?.requiredBalance?.toFixed(4)} {watch("assetId")}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setPopupState("")}
            className="my-5 w-full rounded-md border-2 px-4 py-2 font-semibold text-[#C2912E]"
            style={{ backgroundColor: "#fff", borderColor: "#C2912E" }}
          >
            Cancel
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default UploadCSV;
