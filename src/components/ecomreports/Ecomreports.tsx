import React, { Fragment, useEffect, useState } from "react";
// import download from "~/assets/general/download_icon.svg";
import cancel from "~/assets/general/cancel_icon.svg";
import filtericon from "~/assets/general/filter.svg";
import Image, { type StaticImageData } from "next/image";
import { Controller, useForm } from "react-hook-form";
// import ExchangeDropdown from "../common/ExchangeDropdown";
import TableComponent from "./TableComponent";
import { getOperationTypeUserpanel } from "../../service/api/pricelists";
import { getAllAssets } from "../../service/api/accounts";
import { MenuItem, Select, TextField } from "@mui/material";
import localStorageService from "~/service/LocalstorageService";

export interface currencyType {
  id: number;
  name: string;
  fireblockAssetId: string;
}

const Ecomreports = () => {
  const { control, handleSubmit } = useForm();

  const [showFilter, setShowFilter] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const filterHandleChange = () => {
    setShowFilter(!showFilter);
  };

  const handleApplyFilters = () => {
    // Perform any necessary actions when filters are applied
    // You can make API calls or update the state as needed
  };

  const handleResetFilters = () => {
    // Reset filter
    setSelectedCurrency("");
    setSelectedTransaction("");
    setSelectedClientId("");
    setStartDate("");
    setEndDate("");
  };
  const [operationType, setoperationType] = useState<TransferFees[]>([]);
  const [assets, setAssets] = useState<Assets[]>([]);

  useEffect(() => {
    const getOperationType = async () => {
      const [res] = await getAllAssets();

      if (res !== null && "body" in res) {
        const filtredAssets = res.body.filter(
          (item) => item.fireblockAssetId !== "USD",
        );
        setAssets(filtredAssets);
      }
    };

    const getAssetsType = async () => {
      const [res] = await getOperationTypeUserpanel();

      if (res !== null && "body" in res) {
        const filteredReports = res.body.filter(
          (item) => item.name !== "transferFee" && item.name !== "fee",
        );
        setoperationType(filteredReports);
      }
    };

    getOperationType();
    getAssetsType();
  }, []);

  return (
    <div className=" dashboardContainer relative m-auto w-[95%]">
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50">
              <Image
                src={filtericon as StaticImageData}
                alt=""
                className="h-5 w-5"
              />
            </div>
            <div>
              <p className="text-base font-bold text-black">Filters</p>
              <p className="text-xs text-white">
                Refine your transactions history
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={filterHandleChange}
            className="flex items-center gap-2 rounded-md border border-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-50"
          >
            {showFilter ? "Hide Filters" : "View Filters"}
            <Image
              src={(showFilter ? cancel : filtericon) as StaticImageData}
              alt=""
              className="h-3 w-3"
            />
          </button>
        </div>

        {/* dropdowns  */}
        {showFilter && (
          <form onSubmit={handleSubmit(handleApplyFilters)}>
            <div className="mt-5 grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* <ExchangeDropdown
                name="currency"
                label="Currency"
                control={control}
                options={assets.map((item) => ({
                  value: item.name,
                  label: item.name,
                }))}
                value={selectedCurrency}
                onChange={(selectedOption) => {
                  console.log("Selected Currency:", selectedOption.value);
                  setSelectedCurrency(selectedOption.value);
                }}
                placeholder="Currency"
              /> */}

              <div>
                <p>Currency</p>
                <Select
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                  }}
                  MenuProps={{
                    style: { maxWidth: "200px" },
                  }}
                  value={selectedCurrency}
                  size="small"
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="mb-2 mt-1 w-full rounded-md outline outline-1 outline-[#c4c4c4]"
                >
                  {assets.map(
                    (item) =>
                      item.name !== "Any" && (
                        <MenuItem
                          key={item.fireblockAssetId}
                          value={item.fireblockAssetId}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              width="30"
                              height="30"
                              src={item.icon}
                              alt="icon"
                            />
                            {item.name}
                          </div>
                        </MenuItem>
                      ),
                  )}
                </Select>
              </div>

              <div>
                <p>Transactions</p>
                <Select
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                  }}
                  MenuProps={{
                    style: { maxWidth: "200px" },
                  }}
                  value={selectedTransaction}
                  size="small"
                  onChange={(e) => setSelectedTransaction(e.target.value)}
                  className="mb-2 mt-1 w-full rounded-md outline outline-1 outline-[#c4c4c4]"
                >
                  {operationType.map((item) => (
                    <MenuItem key={item.displayName} value={item.id}>
                      {item.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div>
                <p>Client ID</p>
                <Controller
                  control={control}
                  name={"clientId"}
                  render={() => {
                    return (
                      <Fragment>
                        <TextField
                          type="text"
                          style={{
                            borderRadius: "5px",
                            border: "1px #e5e7eb solid",
                            marginBottom: "1px"
                          }}
                          className="bg-white mb-1 border-0" 
                          size="small"
                          fullWidth
                          onChange={(e) => setSelectedClientId(e.target.value)}
                          value={selectedClientId}
                          placeholder="Client Id"
                          variant="outlined"
                        />
                      </Fragment>
                    )
                  }}
                />
              </div>
              <div>
                <p>Start date</p>
                <input
                  type="date"
                  className=" mb-2 mt-1 w-full rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                  max={endDate}
                />
              </div>
              <div>
                <p>End date</p>
                <input
                  type="date"
                  className=" mb-2 mt-1 w-full  rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-gradient-to-r from-blue-500 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-50"
                >
                  <span className="text-base">&#x21bb;</span>
                  Reset Filters
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* table  */}
      <div className="pb-1">
        <TableComponent
          selectedCurrency={selectedCurrency}
          selectedTransaction={selectedTransaction}
          selectedClientId={selectedClientId}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default Ecomreports;
