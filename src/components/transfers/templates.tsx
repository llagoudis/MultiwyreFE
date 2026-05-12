import { Fragment, useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import {
  createWhitelistAddress,
  deleteWhitelistAddress,
} from "~/service/api/accounts";
import MuiButton from "~/components/MuiButton";
import Image from "next/image";
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
      <div className="mt-8 grid grid-cols-1 gap-12  md:grid-cols-2">
        <form onSubmit={handleSubmit(onTemplateSubmit)}>
          <div className="h-[70vh] rounded bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)]">
            <div>
              <p className=" mb-2">Whitelisted Address</p>
              <Controller
                name="assetId"
                control={control}
                rules={{
                  required: "Please select an asset",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <Fragment>
                    <Autocomplete
                      size="small"
                      options={filterdAssets}
                      onChange={(_, value) =>
                        onChange(value?.fireblockAssetId ?? "")
                      }
                      getOptionLabel={(option) => option.name}
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
                              const assetValue = assets.find(
                                (item) => item.fireblockAssetId === value,
                              );
                              return (
                                <Fragment>
                                  {assetValue && (
                                    <Image
                                      className="ml-2 h-5 w-4"
                                      src={assetValue.icon ?? ""}
                                      alt={assetValue.name}
                                      width={80}
                                      height={80}
                                    />
                                  )}
                                  {params.InputProps.startAdornment}
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
            <div className=" flex w-full flex-col gap-4">
              <p className="mb-4 mt-8 font-bold">Add withdrawal address</p>
              <div className="">
                <p className="mb-2 text-sm">Withdrawal address *</p>

                <Controller
                  name="assetAddress"
                  control={control}
                  rules={{
                    required: "Please add wallet address",
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <Fragment>
                      <TextField
                        variant="outlined"
                        placeholder="Withdrawal address *"
                        size="small"
                        fullWidth
                        onChange={onChange}
                        value={value ?? ""}
                      />
                      <p className="text-sm text-red-500">{error?.message}</p>
                    </Fragment>
                  )}
                />
              </div>
              <div>
                <p className="mb-2 text-sm">Address label *</p>
                <Controller
                  name="label"
                  control={control}
                  rules={{
                    required: "Please enter address label",
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <Fragment>
                      <TextField
                        variant="outlined"
                        placeholder="Add address label "
                        size="small"
                        fullWidth
                        onChange={onChange}
                        value={value ?? ""}
                      />
                      <p className="text-sm text-red-500">{error?.message}</p>
                    </Fragment>
                  )}
                />
              </div>
              <div>
                <p className="mb-2 text-sm">Address description </p>
                <Controller
                  name="description"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <Fragment>
                      <TextField
                        variant="outlined"
                        placeholder="Add address description "
                        size="small"
                        fullWidth
                        onChange={onChange}
                        value={value ?? ""}
                      />
                      <p className="text-sm text-red-500">{error?.message}</p>
                    </Fragment>
                  )}
                />
              </div>
              <div className=" ml-auto w-fit">
                <MuiButton name="Add whitelist address" type="submit" />
              </div>
            </div>
          </div>
        </form>

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

        <div className=" flex h-[70vh] flex-col gap-4 overflow-y-auto rounded bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)]">
          <div className=" border-b-2 pb-2">
            <p className=" text-base font-bold">White listed addresses</p>
          </div>
          {whitelistedAddress.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b-2 pb-6 pt-2"
            >
              <div>
                <p className="text-base font-bold">
                  <span className="text-base font-bold">Asset : </span>
                  {item.assetId}
                </p>
                <p className="text-base font-bold">
                  <span className="text-base font-bold">label : </span>
                  {item.label}
                </p>
                <p className="">
                  <span className="text-base font-bold">Description : </span>
                  {item.description}
                </p>
                <p className="">
                  <span className="text-base font-bold">Wallet address : </span>
                  {item.assetAddress}
                </p>
              </div>
              <p
                className="cursor-pointer text-xs text-[#217EFD]"
                onClick={() => void deleteAddress(item.id, i)}
              >
                Remove
              </p>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default Templates;
