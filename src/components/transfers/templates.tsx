import { Fragment, useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import {
  createWhitelistAddress,
  deleteWhitelistAddress,
} from "~/service/api/accounts";
import MuiButton from "~/components/MuiButton";
import Image from "next/image";
import WhitelistIcon from "~/assets/images/whitelist-address.png";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import ConfirmTemplate from "./template/ConfirmTemplate";
import TwoFA from "../TwoFA";
import useGlobalStore from "~/store/useGlobalStore";
import toast from "react-hot-toast";
import TransitionDialog from "../common/TransitionDialog";

type PopupState = "CONFIRM" | "2FA" | "";

const defaultFormValues = {
  assetAddress: "",
  assetId: "",
  description: "",
  label: "",
};
const Templates = () => {
  const [whitelistedAddress, syncWhitelistedAddress] = useGlobalStore(
    (state) => [state.whitelistedAddress, state.syncWhitelistedAddress],
  );
  const assets = useAsyncMasterStore<"assets">("assets");
  const filterdAssets = assets.filter(
    (item) =>
      item.fireblockAssetId !== "EUR" && item.fireblockAssetId !== "USD",
  );
  const [confirmationPopup, setConfirmationPopup] = useState<PopupState>();
  const [templateData, setTemplateData] = useState<TemplateFormType>();

  const { control, handleSubmit, reset } = useForm<TemplateFormType>({
    defaultValues: defaultFormValues,
  });

  const onTemplateSubmit = (data: TemplateFormType) => {
    data = { ...data, assetAddress: data.assetAddress.trim() };
    setConfirmationPopup("CONFIRM");
    setTemplateData(data);
  };

  const createTemplate = async () => {
    if (templateData) {
      await createWhitelistAddress(templateData).then(([res, err]) => {
        if (res?.success) {
          useGlobalStore.setState((prev) => {
            const nextState = { ...prev };
            nextState.whitelistedAddress.push(res?.body);
            return nextState;
          });
          reset(defaultFormValues);
          setConfirmationPopup("");
        }

        if (err) {
          toast.error(err || "Failed to whitelist address");
        }
      });
    }
  };

  const deleteAddress = async (id: string | number, idx: number) => {
    const [res, err] = await deleteWhitelistAddress(id);
    if (err) {
      toast.error(err);
    }

    if (res?.success) {
      useGlobalStore.setState((prev) => {
        const nextState = { ...prev };
        nextState.whitelistedAddress.splice(idx, 1);
        return nextState;
      });
      toast.success("Successfully removed address");
    }
  };
  useEffect(() => {
    syncWhitelistedAddress();
  }, []);

  return (
    <Fragment>
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Add Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 sticky top-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FFEDF2] flex items-center justify-center text-[#FF3D71]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1A1C1E]">Add white listed address</h3>
            </div>

            <form onSubmit={handleSubmit(onTemplateSubmit)} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Currency</label>
                <Controller
                  name="assetId"
                  control={control}
                  rules={{ required: "Please select an asset" }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <div className="relative">
                      <Autocomplete
                        size="small"
                        options={filterdAssets}
                        onChange={(_, val) => onChange(val?.fireblockAssetId ?? "")}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => (
                          <li {...props} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                              <Image src={option.icon ?? ""} alt={option.name} width={24} height={24} className="object-contain" />
                            </div>
                            <span className="font-bold text-sm text-[#1A1C1E]">{option.name}</span>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Currency"
                            error={!!error}
                            InputProps={{
                              ...params.InputProps,
                              className: "rounded-xl bg-white border-gray-200 hover:border-[#4775F2] focus-within:border-[#4775F2] transition-all h-[44px] px-4",
                              startAdornment: value && (
                                <div className="flex items-center mr-2">
                                  <Image
                                    src={assets.find(a => a.fireblockAssetId === value)?.icon ?? ""}
                                    alt="icon"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                  />
                                </div>
                              ),
                            }}
                          />
                        )}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            "& fieldset": { borderColor: "#E2E8F0" },
                          },
                        }}
                      />
                      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Withdrawal address</label>
                <Controller
                  name="assetAddress"
                  control={control}
                  rules={{ required: "Please add wallet address" }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <div className="flex flex-col">
                      <input
                        placeholder="Enter Withdrawal Address"
                        className={`w-full h-[44px] px-4 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} hover:border-[#4775F2] focus:border-[#4775F2] outline-none transition-all font-medium text-[#1A1C1E]`}
                        onChange={onChange}
                        value={value ?? ""}
                      />
                      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Address label</label>
                <Controller
                  name="label"
                  control={control}
                  rules={{ required: "Please enter address label" }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <div className="flex flex-col">
                      <input
                        placeholder="e.g. My Ledger Wallet"
                        className={`w-full h-[44px] px-4 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} hover:border-[#4775F2] focus:border-[#4775F2] outline-none transition-all font-medium text-[#1A1C1E]`}
                        onChange={onChange}
                        value={value ?? ""}
                      />
                      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Address description</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <textarea
                      placeholder="Add a short description (optional)"
                      className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 hover:border-[#4775F2] focus:border-[#4775F2] outline-none transition-all font-medium text-[#1A1C1E] resize-none"
                      value={value ?? ""}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-gradient text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
              >
                Add whitelist address
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Address List */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 min-h-[550px] h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FFEDF2] flex items-center justify-center text-[#FF3D71]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1A1C1E]">White listed addresses</h3>
            </div>

            <div className="flex-1 overflow-y-auto  pr-2 custom-scroll">
              <div className="w-full mb-4 px-4 py-3 bg-[#F8F9FA] border border-[#C9C9C9] border-l-0 border-r-0  flex items-center text-xs font-bold text-[#8B8D91] uppercase tracking-wider">
                <div className="w-1/3">Address Label</div>
                <div className="w-1/3 text-center">Withdrawal Address</div>
                <div className="w-1/3 text-right">Description</div>
              </div>

              {whitelistedAddress.length > 0 ? (
                whitelistedAddress.map((item, i) => (
                  <div
                    key={item.id}
                    className="group hover:bg-[#F0F5FF] p-4 rounded-2xl transition-all duration-300 flex items-center text-sm"
                  >
                    <div className="w-1/3 font-bold text-[#1A1C1E]">{item.label}</div>
                    <div className="w-1/3 text-center text-[#4775F2] font-mono truncate px-2">{item.assetAddress}</div>
                    <div className="w-1/3 text-right text-[#8B8D91] flex items-center justify-end gap-3">
                      <span className="truncate">{item.description || '-'}</span>
                      <button
                        onClick={() => void deleteAddress(item.id, i)}
                        className="text-[#BABABA] hover:text-[#FF3D71] p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-56 h-28 mb-4 ">
                    <Image
                      src={WhitelistIcon}
                      alt="Empty"
                      className="object-contain"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-[#1A1C1E] mb-2">No whitelisted addresses yet</h4>
                  <p className="text-sm text-[#8B8D91] ">Add your first withdrawal address to get started</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#8B8D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-xs text-[#8B8D91] italic">
                Manage trusted withdrawal addresses to protect your funds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TransitionDialog
        open={!!confirmationPopup}
        onClose={() => setConfirmationPopup("")}
      >
        {confirmationPopup === "CONFIRM" ? (
          <ConfirmTemplate
            onClose={() => setConfirmationPopup("")}
            onConfirm={() => setConfirmationPopup("2FA")}
            assetAddress={templateData?.assetAddress}
            label={templateData?.label}
          />
        ) : (
          confirmationPopup === "2FA" && (
            <TwoFA
              onClose={() => setConfirmationPopup("")}
              onSubmit={createTemplate}
            />
          )
        )}
      </TransitionDialog>
    </Fragment>
  );
};

export default Templates;
