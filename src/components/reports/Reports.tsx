import { useEffect, useState } from "react";
// import download from "~/assets/general/download_icon.svg";
import Image, { type StaticImageData } from "next/image";
import { useForm } from "react-hook-form";
import cancel from "~/assets/general/cancel_icon.svg";
import filtericon from "~/assets/general/filter.svg";
// import ExchangeDropdown from "../common/ExchangeDropdown";
import { getOperationTypeUserpanel } from "../../service/api/pricelists";

import { getAllAssets } from "../../service/api/accounts";
import { MenuItem, Select } from "@mui/material";
import TableComponent from "../TableComponent";

export interface currencyType {
  id: number;
  name: string;
}

const Reports = () => {
  const { control, handleSubmit } = useForm();

  const [showFilter, setShowFilter] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentTab, setCurrentTab] = useState(0);
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
    setStartDate("");
    setEndDate("");
  };
  const [operationType, setoperationType] = useState<TransferFees[]>([]);
  const [assets, setAssets] = useState<Assets[]>([]);

  useEffect(() => {
    const getOperationType = async () => {
      const [res] = await getAllAssets();

      if (res !== null && "body" in res) {
        const filteredAssets = res.body.filter(
          (item) =>
            item.fireblockAssetId !== "ETH_TEST5" &&
            item.fireblockAssetId !== "ANY",
        );
        setAssets(filteredAssets);
      }
    };
    getOperationType();

    const getAssetsType = async () => {
      const [res] = await getOperationTypeUserpanel();

      if (res !== null && "body" in res) {
        const filteredReports = res.body.filter(
          (item) =>
            item.name !== "transferFee" &&
            item.name !== "fee" &&
            item.name !== "internalTransfer" &&
            item.name !== "networkFees" &&
            item.name !== "invoiceFees" &&
            item.name !== "fxMarkupFees",
        );

        setoperationType(filteredReports);
      }
    };

    // getOperationType();
    getAssetsType();
  }, []);

  const handleTabChange = (tabIndex: number) => {
    setCurrentTab(tabIndex);
    // Optional: Reset transaction filter when tab changes
    setSelectedTransaction("");
  };

  const getAvailableTransactionTypes = () => {
    switch (currentTab) {
      case 0:
        return operationType.filter((item) => item.id === 1 || item.id === 2);

      case 1:
        return operationType.filter((item) => item.id === 5);

      case 2:
        return operationType.filter((item) => item.id === 5);

      default:
        return operationType;
    }
  };

  const availableTransactions = getAvailableTransactionTypes();
  return (
    <div className=" dashboardContainer relative m-auto w-full">
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFBF3]">
              {/* <Image
                src={filtericon as StaticImageData}
                alt=""
                className="h-5 w-5"
              /> */}
       <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.29 0.00999999H2.21C0.99 0.00999999 0 1 0 2.22C0 2.75 0.19 3.26 0.53 3.66L5.7 9.69C5.89 9.92 6 10.21 6 10.5V16.14C6 16.75 6.31 17.31 6.83 17.63C7.11 17.8 7.43 17.89 7.75 17.89C8.02 17.89 8.28 17.83 8.53 17.7L10.53 16.7C11.13 16.4 11.5 15.8 11.5 15.13V10.49C11.5 10.19 11.61 9.9 11.8 9.68L16.97 3.65C17.31 3.25 17.5 2.74 17.5 2.21C17.5 0.99 16.51 0 15.29 0V0.00999999ZM15.83 2.68L10.66 8.71C10.23 9.21 10 9.84 10 10.5V15.14C10 15.24 9.95 15.32 9.86 15.36L7.86 16.36C7.75 16.42 7.66 16.38 7.62 16.35C7.58 16.32 7.5 16.26 7.5 16.14V10.5C7.5 9.84 7.27 9.21 6.84 8.71L1.67 2.68C1.56 2.55 1.5 2.39 1.5 2.22C1.5 1.83 1.82 1.51 2.21 1.51H15.29C15.68 1.51 16 1.83 16 2.22C16 2.39 15.94 2.55 15.83 2.68Z" fill="#DB33A1"/>
</svg>

            </div>
            <div>
              <p className="text-base font-medium text-black">Filters</p>
              <p className="text-xs text-slate-500">
                Refine your transactions history
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={filterHandleChange}
            className="flex items-center gap-2 rounded-md border border-brand-pink px-4 py-2 text-sm font-semibold text-brand-pink transition hover:bg-pink-50"
          >
            {showFilter ? "Hide Filters" : "View Filters"}
           <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_88_5695)">
<path d="M0.488373 10.0001C0.391786 10.0001 0.297365 9.97146 0.21705 9.9178C0.136736 9.86415 0.0741379 9.78789 0.0371735 9.69865C0.000209163 9.60942 -0.00946059 9.51123 0.00938739 9.4165C0.0282354 9.32177 0.0747543 9.23476 0.14306 9.16647L9.1665 0.143033C9.25808 0.0514506 9.38229 0 9.51181 0C9.64133 0 9.76554 0.0514506 9.85712 0.143033C9.9487 0.234616 10.0002 0.358828 10.0002 0.488346C10.0002 0.617863 9.9487 0.742076 9.85712 0.833658L0.833685 9.8571C0.78838 9.90249 0.734551 9.9385 0.675292 9.96303C0.616033 9.98757 0.55251 10.0002 0.488373 10.0001Z" fill="#DB33A1"/>
<path d="M9.51178 10.0001C9.44765 10.0002 9.38412 9.98757 9.32486 9.96303C9.2656 9.9385 9.21178 9.90249 9.16647 9.8571L0.143033 0.833658C0.0514506 0.742076 0 0.617863 0 0.488346C0 0.358828 0.0514506 0.234616 0.143033 0.143033C0.234616 0.0514506 0.358828 0 0.488346 0C0.617863 0 0.742076 0.0514506 0.833658 0.143033L9.8571 9.16647C9.9254 9.23476 9.97192 9.32177 9.99077 9.4165C10.0096 9.51123 9.99995 9.60942 9.96298 9.69865C9.92602 9.78789 9.86342 9.86415 9.7831 9.9178C9.70279 9.97146 9.60837 10.0001 9.51178 10.0001Z" fill="#DB33A1"/>
</g>
<defs>
<clipPath id="clip0_88_5695">
<rect width="10" height="10" fill="white"/>
</clipPath>
</defs>
</svg>

          </button>
        </div>

        {/* dropdowns  */}
        {showFilter && (
          <form onSubmit={handleSubmit(handleApplyFilters)}>
            <div className="mt-5 grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                  placeholder="Select Currency"
                  className=" mt-1 w-full rounded-lg outline outline-1 outline-[#C9C9C9]"
                >
                  {assets.map(
                    (item) =>
                      item.name !== "Any" && (
                        <MenuItem key={item.name} value={item.fireblockAssetId}>
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

              {/* <div>
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
                  {availableTransactions.map((item) => (
                    <MenuItem key={item.displayName} value={item.id}>
                      {item.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </div> */}

              {/* <ExchangeDropdown
                name="transaction"
                label="Transactions"
                control={control}
                options={operationType.map((item) => ({
                  value: item.displayName,
                  label: item.displayName,
                }))}
                value={selectedTransaction}
                onChange={(value) => setSelectedTransaction(value)}
                placeholder="All Transactions"
              /> */}

              <div>
                <p>Start date</p>
                <input
                  type="date"
                  className="  mt-1 w-full rounded-md px-2 py-2 outline outline-1 outline-[#c4c4c4]"
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
                  className="  mt-1 w-full  rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>

              
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-primary-gradient text-white px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-brand-pink px-4 py-2 text-sm font-semibold text-brand-pink transition hover:bg-pink-50"
                >
                  <span className="text-base">&#x21bb;</span>
                  Reset Filters
                </button>
          
            </div>
          </form>
        )}
      </div>

      {/* table  */}
      <div className="pb-1">
        <TableComponent
          selectedCurrency={selectedCurrency}
          selectedTransaction={selectedTransaction}
          startDate={startDate}
          endDate={endDate}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
};

export default Reports;
