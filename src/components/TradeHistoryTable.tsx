import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "./ReusableTable";

import PdfIcon from "~/assets/images/pdfIcon.svg";
import {
  bigNumber,
  copyToClipboard,
  formatAddress,
  formatDate,
} from "~/helpers/helper";
import useDashboard from "~/hooks/useDashboard";
import { getExchangeTxns } from "~/service/api/transaction";
import { ApiHandler } from "~/service/UtilService";

interface TradeHistoryTableTableProps {
  selectedCurrency?: string;
  selectedTransaction?: string;
  startDate?: string;
  endDate?: string;
  visibleColumns?: string[];
  onDownloadClick?: (
    e?: React.MouseEvent<HTMLButtonElement>,
    row?: TransactionDetails,
  ) => void;
  onFiltersReady?: (filters: filterType[]) => void;
}

interface filterType {
  label: string;
  name: string;
}

const TradeHistoryTableTable: React.FC<TradeHistoryTableTableProps> = ({
  selectedCurrency,
  selectedTransaction,
  startDate,
  endDate,
  visibleColumns = [
    "date",
    "senderaccount",
    "receiveraccount",
    "transactionId",
    "amount",
    "exchangeFee",
    "transactionFee",
    "netAmount",
    "status",
  ],
  onDownloadClick,
  onFiltersReady,
}) => {
  const walletId = useDashboard()?.assets?.[0]?.walletId;

  const [reports, setReports] = useState<TransactionDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });

  const columnFilters: filterType[] = [
    { label: "Date and Time", name: "date" },
    { label: "Sender Account", name: "senderaccount" },
    { label: "Receiver Account", name: "receiveraccount" },
    { label: "Transaction ID", name: "transactionId" },
    { label: "Amount", name: "amount" },
    { label: "Exchange fee", name: "exchangeFee" },
    { label: "Transaction fee", name: "transactionFee" },
    { label: "Net Amount", name: "netAmount" },
    { label: "Status", name: "status" },
  ];

  useEffect(() => {
    if (onFiltersReady) {
      onFiltersReady(columnFilters);
    }
  }, []);

  const transactionColumns = useMemo(
    () => [
      {
        label: "Date and Time",
        name: "date",
        className: "font-semibold",
        getValue: (row: TransactionDetails) => (
          <span className="inline-block max-w-[95px] break-words leading-tight">
            {formatDate(row.createdAt) ?? "-"}
          </span>
        ),
      },
      {
        label: "Sender Account",
        name: "senderaccount",
        type: "image",
        className: "font-bold",
        render: (row: TransactionDetails) => {
          const senderAddress = row.sourceAddress;

          return (
            <div className="flex items-center gap-2 py-2 pr-2">
              {row?.Asset?.icon && (
                <Image
                  className="h-10 w-10 duration-300"
                  src={row?.SourceAsset?.Asset?.icon ?? row?.Asset?.icon}
                  alt="asset"
                  width={20}
                  height={20}
                />
              )}
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">
                  {row?.SourceAsset?.Asset?.name ?? row?.Asset?.name}
                </span>

                <span
                  className={`text-sm font-semibold leading-[1.3rem] text-[#809FB8] ${
                    senderAddress ? "cursor-pointer hover:opacity-80" : ""
                  }`}
                  onClick={() =>
                    senderAddress && copyToClipboard(senderAddress)
                  }
                  title={senderAddress ? "Click to copy address" : undefined}
                >
                  {formatAddress(senderAddress)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        label: "Receiver Account",
        name: "receiveraccount",
        type: "image",
        className: "font-bold",
        render: (row: TransactionDetails) => {
          const receiverAddress =
            row?.operationType === 2 && row.assetId === "EUR"
              ? row?.EuroTransaction?.IBAN
              : row.destinationAddress;

          return (
            <div className="flex items-center gap-2 py-2 pr-2">
              {row?.Asset?.icon && (
                <Image
                  className="h-10 w-10 duration-300"
                  src={row?.DestinationAsset?.Asset?.icon ?? row?.Asset?.icon}
                  alt="asset"
                  width={20}
                  height={20}
                />
              )}
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">
                  {row?.DestinationAsset?.Asset?.name ?? row?.Asset?.name}
                </span>

                <span
                  className={`text-sm font-semibold leading-[1.3rem] text-[#809FB8] ${
                    receiverAddress ? "cursor-pointer hover:opacity-80" : ""
                  }`}
                  onClick={() =>
                    receiverAddress && copyToClipboard(receiverAddress)
                  }
                  title={receiverAddress ? "Click to copy address" : undefined}
                >
                  {formatAddress(receiverAddress)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        label: "Transaction ID",
        name: "transactionId",
        className: "font-bold",
        render: (row: TransactionDetails) => {
          const receiverAddress = row?.transactionId;

          return (
            <span
              className=" cursor-pointer"
              onClick={() =>
                receiverAddress && copyToClipboard(receiverAddress)
              }
              title={receiverAddress ? "Click to copy address" : undefined}
            >
              {formatAddress(receiverAddress)}
            </span>
          );
        },
        // getValue: (row: TransactionDetails) => <span onClick={() =>
        //             receiverAddress && copyToClipboard(receiverAddress)
        //           }>{formatAddress(row?.transactionId)}</span>,
      },
      {
        label: "Amount",
        name: "amount",
        className: "",
        getValue: (row: TransactionDetails) => (
          <span>
            {bigNumber(row?.TransactionFee?.amount)} {row?.assetId}
          </span>
        ),
      },
      {
        label: "Exchange fee",
        name: "exchangeFee",
        getValue: (row: TransactionDetails) => (
          <span>
            {bigNumber(row?.TransactionFee?.exchangeFee)}{" "}
            {row?.TransactionFee?.exchangeFeeCurrency}
          </span>
        ),
      },
      {
        label: "Transaction fee",
        name: "transactionFee",
        getValue: (row: TransactionDetails) => (
          <span>
            {bigNumber(row?.TransactionFee?.transactionFee)}{" "}
            {row?.TransactionFee?.transactionFeeCurrency}
          </span>
        ),
      },
      {
        label: "Net Amount",
        name: "netAmount",
        // className: "text-[#217EFD]",
        getValue: (row: TransactionDetails) => (
          <span>
            {bigNumber(row?.TransactionFee?.creditedAmount)}{" "}
            {row?.destinationAssetId}
          </span>
        ),
      },
      {
        label: "Status",
        name: "status",
        getValue: (row: TransactionDetails) => (
          <span
            className={
              row?.status === "COMPLETED" || row?.status === "CONFIRMED"
                ? "text-[#3cc11f]"
                : row?.status === "PENDING"
                  ? "text-[#d17b25]"
                  : "#f00000"
            }
          >
            {row?.status === "COMPLETED" || row?.status === "CONFIRMED"
              ? "Executed"
              : row?.status === "PENDING"
                ? "Pending"
                : "Failed"}
          </span>
        ),
      },
    ],
    [walletId],
  );

  async function fetchReports(filters: FilterType) {
    setLoading(true);

    // for exchange
    const [res]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getExchangeTxns, filters);

    // console.log({ res });
    setLoading(false);

    if (res?.success && res?.body?.data) {
      setTotalPageCount(res?.body?.pagination?.totalItems ?? 0);
      setReports(res?.body?.data);
    }
  }

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: startDate,
      toDate: endDate,
    };

    if (selectedCurrency) paramsQuery.assetName = selectedCurrency;
    if (selectedTransaction) paramsQuery.operationType = selectedTransaction;

    void fetchReports(paramsQuery);
  }, [pagination, selectedCurrency, selectedTransaction, startDate, endDate]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ page, pageSize });
  };

  const getRowActions = (row: TransactionDetails) => {
    const actions = [];

    if (row.operationType === 5 && row?.status === "COMPLETED") {
      actions.push({
        label: "Download PDF",
        onClick: () => {
          // console.log("Download PDF clicked for row:", row);
          if (onDownloadClick) {
            onDownloadClick(undefined, row);
          }
        },
        renderCustom: () => (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // console.log("Download button clicked for row:", row);
              if (onDownloadClick) {
                onDownloadClick(e, row);
              }
            }}
            className="flex w-max items-center gap-2 rounded-md bg-white px-4 py-2 shadow-md hover:bg-gray-50"
          >
            <Image src={PdfIcon} alt="Download PDF" width={25} height={25} />
            <span className="whitespace-nowrap text-[12px] font-semibold">
              Download PDF
            </span>
          </button>
        ),
      });
    }

    return actions;
  };

  return (
    <ReusableTable
      data={reports}
      columns={transactionColumns}
      loading={loading}
      pagination={{
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalCount: totalPageCount,
      }}
      onPaginationChange={handlePaginationChange}
      visibleColumns={visibleColumns}
      getRowActions={getRowActions}
      emptyMessage="No data found"
    />
  );
};

export default TradeHistoryTableTable;
