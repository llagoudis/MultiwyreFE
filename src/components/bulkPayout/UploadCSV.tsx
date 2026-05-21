import { Autocomplete, Dialog, TextField } from "@mui/material";
import React, { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import Image, { type StaticImageData } from "next/image";
import closeIcon from "../../assets/images/close-circle.svg";
import TransitionDialog from "../common/TransitionDialog";
import TwoFA from "../TwoFA";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
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
        className="m-auto w-full max-w-[640px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="border-b border-slate-100 pb-4">
          <p className="text-lg font-bold text-black">Upload CSV</p>
          <p className="mt-1 text-sm text-slate-500">
            Upload a CSV to start bulk payout.
          </p>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-black">
            Choose Currency
          </p>
          <Controller
            control={control}
            name="assetId"
            rules={{ required: "Please select an asset" }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Fragment>
                <Autocomplete
                  size="small"
                  options={filteredAssets}
                  onChange={(_, nextValue) => {
                    onChange(nextValue?.fireblockAssetId ?? "");
                  }}
                  value={assetValue ? assetValue : null}
                  getOptionLabel={(option) =>
                    option.name ? option.name : value
                  }
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      className="flex cursor-pointer items-center gap-2 p-2"
                    >
                      <Image
                        src={option.icon ?? ""}
                        alt={option.name}
                        width={28}
                        height={28}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {option.fireblockAssetId}
                        </span>
                        <span className="text-xs text-slate-500">
                          {option.name}
                        </span>
                      </div>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select currency"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: assetValue ? (
                          <Image
                            className="ml-2 h-6 w-6"
                            src={assetValue?.icon ?? ""}
                            alt={assetValue?.name}
                            width={24}
                            height={24}
                          />
                        ) : null,
                      }}
                      variant="outlined"
                    />
                  )}
                />
                <p className="mt-1 text-sm text-red-500">{error?.message}</p>
              </Fragment>
            )}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4M12 4l-4 4M12 4l4 4"
                stroke="#DB33A1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
                stroke="#DB33A1"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-black">Upload Files</p>
            <p className="text-xs text-slate-500">
              Select and upload the files of your choice.
            </p>
          </div>
        </div>

        <label
          className={`mt-4 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition ${
            isDragActive ? "border-pink-500 bg-pink-50/40" : "border-slate-300"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 16a5 5 0 1 1 1.6-9.74A6 6 0 0 1 20 11a4 4 0 0 1-1 7.87"
                stroke="#DB33A1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12v8M9 15l3-3 3 3"
                stroke="#DB33A1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-4 text-base font-bold text-black">
            Choose a file or drag &amp; drop it here
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Please upload only one CSV file (up to 5MB)
          </p>
          <span className="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M14 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Browse File
          </span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {selectedFile && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-700">
                CSV
              </div>
              <div className="flex-1">
                <p className="flex items-center justify-between text-sm font-semibold text-black">
                  <span>{selectedFile.name}</span>
                  <Image
                    src={closeIcon as StaticImageData}
                    alt="Remove"
                    className="cursor-pointer"
                    onClick={() => setSelectedFile(null)}
                  />
                </p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            </div>
          </div>
        )}

        <p className="mt-2 text-sm text-red-500">
          {!selectedFile && errors.csv?.message}
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-95 disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Start Bulk Payout"}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/40 px-3 py-2 text-sm text-slate-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
            <path
              d="M12 8v5M12 16h.01"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Make sure your CSV file is correctly formatted to avoid processing
          errors.
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
        onClose={() => setPopupState("")}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <div className="p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
              <Image src={'/assets/icons/Group 1000009403.svg'} alt="" width={100} height={100} className="h-12 w-12 object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-black">
                Insufficient <span className="text-pink-500">Balance</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                You don&apos;t have enough {assetId} to complete this
                transaction.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 1v22M5 12h14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">
                      Current Balance
                    </p>
                    <p className="text-sm font-bold text-black">
                      {balanceError?.projectBalance?.toFixed(4)} {watch("assetId")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-100">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 19V5M5 12l7-7 7 7" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">
                      Required Amount
                    </p>
                    <p className="text-sm font-bold text-black">
                      {balanceError?.requiredBalance?.toFixed(4)} {watch("assetId")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPopupState("")}
            className="mt-6 w-full rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default UploadCSV;
