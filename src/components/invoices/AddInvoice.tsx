import React, { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Autocomplete,
  Box,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import MuiButton from "../MuiButton";
import Image from "next/image";
import { createInvoices } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import SelectComponent from "../common/SelectComponent";
import { getAllCustomerMerchants } from "~/service/api/accounts";

type propType = {
  onClose: (value?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  setInvoiceUpdated: React.Dispatch<React.SetStateAction<boolean>>;
};

// Add unique ID to each billing item
type BillingItem = {
  id: number;
  description: string;
  amount: string;
};

// Extend InvoiceForm to include billingItems for react-hook-form type safety
type InvoiceForm = {
  name: string;
  billingAddress: string;
  currency: string;
  amount: string;
  email?: string;
  projectId: string;
  billingItems: {
    description: string;
    amount: string;
  }[];
};

const AddInvoice = ({ onClose, invoice, openAdd }: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
    unregister, // Add unregister to clean up form fields
  } = useForm<InvoiceForm>();

  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<any>([]);

  const fetchMerchants = async () => {
    const [response] = await getAllCustomerMerchants();
    if (response?.body) {
      setMerchants(response?.body);

      if (response?.body.length === 1) {
        const projectId = response?.body[0]?.projectId;

        setValue("projectId", projectId ?? "");
      }
    }
  };

  useEffect(() => {
    void fetchMerchants();
  }, []);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([
    { id: Date.now(), description: "", amount: "" },
  ]);
  const [nextId, setNextId] = useState(Date.now() + 1); // Track next ID

  const currencyWatch = watch("currency");
  const totalAmount = billingItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  useEffect(() => {
    setValue("amount", totalAmount.toString());
  }, [totalAmount, setValue]);

  const addBillingItem = () => {
    const newId = nextId;
    setBillingItems([
      ...billingItems,
      { id: newId, description: "", amount: "" },
    ]);
    setNextId(nextId + 1);
  };

  const removeBillingItem = (idToRemove: number) => {
    // Find the index of the item to remove
    const indexToRemove = billingItems.findIndex(
      (item) => item.id === idToRemove,
    );

    if (indexToRemove !== -1) {
      // Unregister the form fields for this item
      unregister(`billingItems.${indexToRemove}.description`);
      unregister(`billingItems.${indexToRemove}.amount`);

      // Remove the item from the array
      setBillingItems(billingItems.filter((item) => item.id !== idToRemove));
    }
  };

  const currencyList = [
    {
      fireblockAssetId: "EUR",
      icon: "https://cryptoprocessingstorage.blob.core.windows.net/static-images/euro.svg",
      id: 13,
      krakenAssetId: "EUR",
      name: "Euro",
      order: 0,
    },
    {
      fireblockAssetId: "USD",
      icon: "https://cryptoprocessingstorage.blob.core.windows.net/static-images/USDC.105a37.svg",
      id: 50,
      krakenAssetId: "USD",
      name: "USD",
      order: null,
    },
  ];

  const assetValue = currencyList.find(
    (item) => item.fireblockAssetId === currencyWatch,
  );

  const currencyMap: Record<string, { symbol: string; code: string }> = {
    USD: { symbol: "$", code: "USD" },
    EUR: { symbol: "€", code: "EUR" },
  };

  const currencyData = currencyMap[currencyWatch] ?? { symbol: "", code: "" };

  useEffect(() => {
    reset({
      ...invoice,
    });
  }, [invoice, reset]);

  const onSubmit = async (values: InvoiceForm) => {
    setLoading(true);
    const payload = {
      name: values.name,
      billingItems,
      billingAddress: values.billingAddress,
      currency: values.currency,
      amount: totalAmount,
      email: values.email ?? null,
      projectId: values.projectId,
    };
    const [res]: APIResult<any> = await ApiHandler(createInvoices, payload);
    setLoading(false);
    if (res?.success) {
      onClose("success");
    }
  };

  return (
    <Dialog
      open={Boolean(openAdd)}
      onClose={() => onClose()}
      fullWidth
      className="ml-auto max-w-2xl"
    >
      <div className="p-4">
        <DialogTitle className="fontFamily !pb-0 text-start text-3xl font-semibold">
          Enter invoice details
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <ExchangeInput
              control={control}
              placeholder="Enter Bill To"
              label="Bill To"
              name="name"
              rules={{ required: "Bill To is required" }}
              type="text"
              textColor="text-[#18181A]"
            />
            <ExchangeInput
              control={control}
              placeholder="Enter Billing Address"
              label="Billing Address"
              name="billingAddress"
              rules={{ required: "Billing Address is required" }}
              type="text"
              textColor="text-[#18181A]"
            />
            {merchants.length > 1 ? (
              <div className=" my-2 space-y-1 ">
                <p>
                  Project <span className="text-red-500">*</span>
                </p>
                <SelectComponent
                  control={control}
                  options={merchants}
                  valueKey="projectId"
                  labelKey="projectName"
                  label="projectId"
                  name="projectId"
                  rules={{ required: "Project is required" }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="mb-1">
                  Project <span className="text-red-500">*</span>
                </p>

                <Controller
                  control={control}
                  name="projectId"
                  defaultValue={merchants[0]?.projectId || ""}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      variant="outlined"
                      {...field}
                      value={merchants[0]?.projectName || ""}
                      disabled
                    />
                  )}
                />
              </div>
            )}
            <div className="my-3">
              <label className="mb-1 block">
                Currency <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="currency"
                rules={{ required: "Please select a currency" }}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <Fragment>
                    <Autocomplete
                      size="small"
                      options={currencyList}
                      getOptionLabel={(option) => option.name || value}
                      onChange={(_, nextValue) => {
                        onChange(nextValue?.fireblockAssetId ?? "");
                      }}
                      value={assetValue ?? null}
                      renderOption={(props, option) => (
                        <li {...props} className="flex items-center gap-2 p-2">
                          <Image
                            src={option.icon}
                            alt={option.name}
                            width={30}
                            height={30}
                          />
                          {option.name}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select currency"
                          variant="outlined"
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                {assetValue && (
                                  <Image
                                    src={assetValue.icon}
                                    alt={assetValue.name}
                                    width={24}
                                    height={24}
                                    style={{ marginLeft: 8 }}
                                  />
                                )}
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Fragment>
                )}
              />
            </div>
            <div className="as">
              <p className=" text-sm font-semibold text-[#18181A]">
                Billing Description
              </p>
              <div className="mt-2 rounded border border-[#E8E8E8] px-2 ">
                {billingItems.map((item, index) => (
                  <div
                    key={item.id} // Use unique ID as key instead of index
                    className="relative  flex items-center gap-2 border-b border-[#E8E8E8] last:border-b-0"
                  >
                    <div className="mt-[6px] flex-1">
                      <ExchangeInput
                        control={control}
                        placeholder="Enter Description"
                        label=""
                        name={`billingItems.${index}.description`}
                        type="text"
                        textColor="text-[#18181A]"
                        rules={{ required: "Description is required" }}
                        ruleDisabled
                        invoiceOutline
                        onChangeExtra={(value) => {
                          setBillingItems((prev) =>
                            prev.map((prevItem) =>
                              prevItem.id === item.id
                                ? { ...prevItem, description: value }
                                : prevItem,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div className="flex w-32 items-center gap-1">
                      <p className=" mt-1">
                        {{ EUR: "€", USD: "$" }[currencyWatch] ?? ""}
                      </p>
                      <ExchangeInput
                        control={control}
                        placeholder="Amount"
                        label=""
                        name={`billingItems.${index}.amount`}
                        type="number"
                        textColor="text-[#18181A]"
                        ruleDisabled
                        invoiceOutline
                        rules={{
                          required: "Amount is required",
                          validate: {
                            min: (v: number) =>
                              v > 0 || "Amount must be greater than zero",
                          },
                        }}
                        onChangeExtra={(value) => {
                          setBillingItems((prev) =>
                            prev.map((prevItem) =>
                              prevItem.id === item.id
                                ? { ...prevItem, amount: value }
                                : prevItem,
                            ),
                          );
                        }}
                      />
                    </div>
                    {billingItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBillingItem(item.id)} // Pass the unique ID
                        className="absolute right-[-2rem] top-[1.5rem]"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.38011 7L4.06445 9.31566L4.68317 9.9344L6.99885 7.61874L9.31451 9.9344L9.93325 9.31566L7.61759 7L9.93319 4.68439L9.31445 4.06567L6.99885 6.38126L4.68324 4.06567L4.06452 4.68439L6.38011 7Z"
                            fill="#080341"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addBillingItem} className="my-2">
                + Add new
              </button>
            </div>

            <div className="mb-4 mt-3">
              <label className="mb-1.5 block font-medium text-[#18181A]">
                Total Amount
              </label>
              <div className="flex items-center rounded-md border border-[#c4c4c4] bg-gray-50 px-4 py-2">
                {currencyData.symbol} {totalAmount || 0}
                {currencyData.code && ` ${currencyData.code}`}
              </div>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input type="hidden" {...field} value={totalAmount} />
                )}
              />
            </div>

            {/* <ExchangeInput
              control={control}
              placeholder="Enter Email"
              label="Email"
              name="email"
              type="text"
              textColor="text-[#18181A]"
            /> */}
          </DialogContent>
          <Box className="flex w-full items-center justify-around gap-4 pb-4">
            <MuiButton
              width="10rem"
              borderRadius="4px"
              name="Cancel"
              type="button"
              variant="outlined"
              background="white"
              borderColor="black"
              color="black"
              onClick={() => onClose()}
            />
            <MuiButton
              width="10rem"
              borderRadius="4px"
              name="Create"
              type="submit"
              loading={loading}
            />
          </Box>
        </form>
      </div>
    </Dialog>
  );
};

export default AddInvoice;
