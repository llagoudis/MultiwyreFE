import { useEffect, useState } from "react";
// import download from "~/assets/general/download_icon.svg";
import Image, { type StaticImageData } from "next/image";
import { useForm } from "react-hook-form";
import cancel from "~/assets/general/cancel_icon.svg";
import filtericon from "~/assets/general/filter.svg";
import Button from "~/components/common/Button";
// import ExchangeDropdown from "../common/ExchangeDropdown";
import { getOperationTypeUserpanel } from "../../service/api/pricelists";

// import { getAllAssets } from "../../service/api/accounts";
import { MenuItem, Select } from "@mui/material";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import MuiButton from "../MuiButton";
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
  // const [assets, setAssets] = useState<Assets[]>([]);

  const allAssets = useAsyncMasterStore<"assets">("assets");
  const assets = allAssets.filter(
    (item) => item.fireblockAssetId !== "ETH_TEST5",
  );

  useEffect(() => {
    // const getOperationType = async () => {
    //   const [res] = await getAllAssets();

    //   if (res !== null && "body" in res) {
    //     const filterdAssets = req?.body.filter((item)=> item.fireblockAssetId !== "ETH_TEST5")
    //     setAssets(res.body);
    //   }
    // };

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
    <div className=" dashboardContainer relative m-auto w-[95%]">
      <div>
        <div className=" mt-8 flex justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={
                showFilter
                  ? (cancel as StaticImageData)
                  : (filtericon as StaticImageData)
              }
              alt=""
              className="cursor-pointer"
              onClick={filterHandleChange}
            />
            <p
              className="cursor-pointer text-sm font-bold"
              onClick={filterHandleChange}
            >
              {!showFilter ? "View filters" : "Hide Filter"}
            </p>
          </div>
          {/* <Image
            src={download as StaticImageData}
            alt=""
            className="cursor-pointer"
          /> */}
        </div>

        <br />

        {/* dropdowns  */}
        {showFilter && (
          <form onSubmit={handleSubmit(handleApplyFilters)}>
            <div className="mb-8 grid grid-cols-1 items-center gap-5 rounded-lg border border-slate-200 p-5 shadow md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-5">
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

              <div className="col-span-2 mt-4 flex w-full justify-between">
                <div className="grid w-full grid-cols-2 gap-4">
                  <Button
                    className="flex w-full justify-center bg-gradient-to-r from-blue-500 to-purple-700px-4 py-3 "
                    title={"Apply Filters"}
                    type="submit"
                  />
                  <MuiButton
                    className="flex w-full justify-center"
                    name={"Reset Filters"}
                    background="#ffffff"
                    color="#C1922E"
                    padding="0.4rem 0.75rem"
                    onClick={handleResetFilters}
                  />
                </div>
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
          startDate={startDate}
          endDate={endDate}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
};

export default Reports;
