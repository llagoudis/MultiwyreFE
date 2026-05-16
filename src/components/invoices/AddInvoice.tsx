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
    unregister,
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
  const [nextId, setNextId] = useState(Date.now() + 1);

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
    const indexToRemove = billingItems.findIndex((item) => item.id === idToRemove);
    if (indexToRemove !== -1) {
      unregister(`billingItems.${indexToRemove}.description`);
      unregister(`billingItems.${indexToRemove}.amount`);
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

  const currencyData = currencyMap[currencyWatch] ?? { symbol: "$", code: "" };

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
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          padding: "0px",
          maxWidth: "640px",
        }
      }}
    >
      <div className="flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#1A1C1E]">
            Enter invoice details
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-2">

          <div className="flex items-center gap-3 w-full">
            <div className="space-y-1.5 w-full">
              <label className="text-sm font-bold text-[#1A1C1E]">
                Bill to<span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Bill to is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder="Enter bill to"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        backgroundColor: "#FFFFFF",
                        "& fieldset": { borderColor: "#E2E8F0" },
                      }
                    }}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5 w-full">
              <label className="text-sm font-bold text-[#1A1C1E]">
                Billing Address<span className="text-red-500">*</span>
              </label>
              <Controller
                name="billingAddress"
                control={control}
                rules={{ required: "Billing Address is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder="Enter billing Address"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        backgroundColor: "#FFFFFF",
                        "& fieldset": { borderColor: "#E2E8F0" },
                      }
                    }}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1A1C1E]">
              Project<span className="text-red-500">*</span>
            </label>
            <Controller
              name="projectId"
              control={control}
              rules={{ required: "Project is required" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={merchants}
                  getOptionLabel={(option) => option.projectName || ""}
                  onChange={(_, value) => field.onChange(value?.projectId || "")}
                  value={merchants.find((m: any) => m.projectId === field.value) || null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select or type proect"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          backgroundColor: "#FFFFFF",
                          "& fieldset": { borderColor: "#E2E8F0" },
                        }
                      }}
                    />
                  )}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1A1C1E]">
              Currency<span className="text-red-500">*</span>
            </label>
            <Controller
              name="currency"
              control={control}
              rules={{ required: "Currency is required" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={currencyList}
                  getOptionLabel={(option) => option.name || ""}
                  onChange={(_, value) => field.onChange(value?.fireblockAssetId || "")}
                  value={currencyList.find((c) => c.fireblockAssetId === field.value) || null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select currency"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          backgroundColor: "#FFFFFF",
                          "& fieldset": { borderColor: "#E2E8F0" },
                        }
                      }}
                    />
                  )}
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-[#1A1C1E]">Billing Description</p>
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div className="flex bg-[#F8F9FA] px-4 py-2 border-b border-[#E2E8F0]">
                <span className="flex-1 text-[10px] font-bold text-[#8B8D91]">DESCRIPTION</span>
                <span className="w-40 text-[10px] font-bold text-[#8B8D91] pl-4">AMOUNT</span>
                <span className="w-8"></span>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {billingItems.map((item, index) => (
                  <div key={item.id} className="flex items-center px-4 py-3 gap-3">
                    <div className="flex-1">
                      <Controller
                        name={`billingItems.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            placeholder="Enter Description"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "6px",
                                backgroundColor: "#FFFFFF",
                                "& fieldset": { borderColor: "#E2E8F0" },
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                    <div className="w-40 flex items-center">
                      <div className="h-10 px-3 flex items-center bg-[#F8F9FA] border border-r-0 border-[#E2E8F0] rounded-l-lg text-sm text-[#1A1C1E]">
                        {currencyData.symbol}
                      </div>
                      <Controller
                        name={`billingItems.${index}.amount`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            size="small"
                            placeholder="0.00"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setBillingItems(prev => prev.map(bi => bi.id === item.id ? { ...bi, amount: e.target.value } : bi));
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0 8px 8px 0",
                                backgroundColor: "#FFFFFF",
                                "& fieldset": { borderColor: "#E2E8F0" },
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBillingItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-[#FF3B3B] hover:bg-red-50 rounded-md transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addBillingItem}
              className="px-4 py-2 bg-[#FFF8F1] text-[#FFA800] text-xs font-bold rounded-lg border border-[#FFA80033] hover:bg-[#FFF2E6] transition-colors"
            >
              + Add new item
            </button>
          </div>

          <div className="flex items-center">
            <div className="h-12 px-4 flex items-center bg-[#F8F9FA] border border-r-0 border-[#E2E8F0] rounded-l-lg text-sm text-[#1A1C1E]">
              {currencyData.symbol}
            </div>
            <TextField
              fullWidth
              disabled
              value={totalAmount.toFixed(2)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "0 8px 8px 0",
                  backgroundColor: "#FFFFFF",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&.Mui-disabled": {
                    "-webkit-text-fill-color": "#1A1C1E",
                  }
                }
              }}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 py-3 border border-[#E2E8F0] rounded-md text-sm font-bold text-[#8B8D91] hover:bg-gray-50 transition-colors"
            >
              Create New Invoice
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-[#4775F2] to-[#B647F2] rounded-md text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create New Invoice"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default AddInvoice;
