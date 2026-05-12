import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import {
  bigNumber,
  copyToClipboard,
  formatAddress,
  formatDate,
} from "~/helpers/helper";

import { getTransactionExplorerUrl } from "~/helpers/transactionExplorer";
import useDashboard from "~/hooks/useDashboard";
import { getTransactions } from "~/service/api/transaction";
import { ApiHandler } from "~/service/UtilService";
import ReusableTable from "./ReusableTable";

interface TransactionHistoryTableProps {
  selectedCurrency?: string;
  selectedTransaction?: string;
  startDate?: string;
  endDate?: string;
  visibleColumns?: string[];
  onDownloadClick?: (row: TransactionDetails) => void;
  onFiltersReady?: (filters: filterType[]) => void;
}

interface filterType {
  label: string;
  name: string;
}

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
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
    "balance",
    "status",
  ],
  onDownloadClick,
  onFiltersReady,
}) => {
  const router = useRouter();
  const walletId = useDashboard()?.assets?.[0]?.walletId;

  const [reports, setReports] = useState<TransactionDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });

  // console.log("reports", reports);

  const columnFilters: filterType[] = [
    { label: "Date", name: "date" },
    { label: "Type", name: "transactionType" },
    { label: "Wallet", name: "senderaccount" },
    { label: "Asset", name: "asset" },
    { label: "Fee", name: "transactionFee" },
    { label: "Amount", name: "amount" },
    { label: "Balance", name: "balance" },
    { label: "Transaction Hash", name: "transactionId" },
  ];

  useEffect(() => {
    if (onFiltersReady) {
      onFiltersReady(columnFilters);
    }
  }, []);

  // Column definitions
  const transactionColumns = useMemo(
    () => [
      {
        label: "Date",
        name: "date",
        className: "font-semibold ",
        getValue: (row: TransactionDetails) => (
          <span className="inline-block max-w-[95px] break-words leading-tight">
            {formatDate(row.createdAt) ?? "-"}
          </span>
        ),
      },
      {
        label: "Type",
        name: "transactionType",
        className: "font-normal",
        getValue: (row: TransactionDetails) => {
          if (row.OperationType?.displayName === "Internal Transfer") {
            if (row.sourceId === walletId) {
              return "Withdrawal";
            } else if (row.destinationId === walletId) {
              return "Deposit";
            }
          }
          return row.OperationType?.displayName === "Outgoing Transfer"
            ? "Withdrawal"
            : row.OperationType?.displayName === "Incoming Transfer"
              ? "Deposit"
              : "-";
        },
      },
      {
        label: "Wallet",
        name: "senderaccount",
        type: "image",
        className: "font-bold",
        render: (row: TransactionDetails) => (
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
              <span className="font-semibold">
                {row?.SourceAsset?.Asset?.name ?? row?.Asset?.name}
              </span>

              <div className="flex items-center gap-4">
                {/* FROM */}

                {(() => {
                  const fromAddress =
                    row?.operationType === 2
                      ? row?.sourceAddress
                      : row?.operationType === 1
                        ? row?.sourceAddress
                        : undefined;

                  return !fromAddress ? (
                    " "
                  ) : (
                    <div className="flex items-center gap-2 text-[#809FB8]">
                      <div className="flex items-center gap-2">
                        <span className=" font-medium text-[#a3a3a3]">
                          From
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold leading-[1.3rem] ${
                              fromAddress
                                ? "cursor-pointer hover:opacity-80"
                                : ""
                            }`}
                            onClick={() =>
                              fromAddress && copyToClipboard(fromAddress)
                            }
                            title={
                              fromAddress ? "Click to copy address" : undefined
                            }
                          >
                            {formatAddress(fromAddress)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* TO */}

                {(() => {
                  const toAddress =
                    row?.operationType === 1
                      ? row?.destinationAddress
                      : row?.operationType === 2
                        ? row?.destinationAddress
                        : undefined;

                  return !toAddress ? (
                    " "
                  ) : (
                    <div className="flex items-center gap-2 text-[#809FB8]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#a3a3a3]">To</span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold leading-[1.3rem] ${
                              toAddress ? "cursor-pointer hover:opacity-80" : ""
                            }`}
                            onClick={() =>
                              toAddress && copyToClipboard(toAddress)
                            }
                            title={
                              toAddress ? "Click to copy address" : undefined
                            }
                          >
                            {formatAddress(toAddress)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ),
      },
      {
        label: "Asset",
        name: "asset",
        getValue: (row: TransactionDetails) =>
          row?.SourceAsset?.Asset?.name ?? row?.Asset?.name,
      },
      {
        label: "Amount",
        name: "amount",
        className: " font-semibold",
        getValue: (row: TransactionDetails) =>
          row.operationType === 2 ? (
            <span className="text-[#f00000]">
              {bigNumber(row?.TransactionFee?.amount)}
            </span>
          ) : row.operationType === 1 ? (
            <span className="text-[#3cc11f]">
              {bigNumber(row?.TransactionFee?.amount)}
            </span>
          ) : (
            "-"
          ),
      },
      {
        label: "Fee",
        name: "transactionFee",
        getValue: (row: TransactionDetails) =>
          bigNumber(row?.TransactionFee?.transactionFee),
      },

      {
        label: "Balance",
        name: "balance",
        getValue: (row: TransactionDetails) =>
          bigNumber(row?.TransactionFee?.balance),
      },
      {
        label: "Transaction Hash",
        name: "transactionId",
        className: "font-bold ",
        render: (row: TransactionDetails) => {
          const explorerUrl = getTransactionExplorerUrl(
            row?.txHash,
            row?.assetId,
          );

          if (!row?.txHash) return "-";

          return (
            <div className="flex items-center gap-2">
              {explorerUrl ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#217EFD] underline"
                >
                  {formatAddress(row.txHash)}
                </a>
              ) : (
                <span>{formatAddress(row.txHash)}</span>
              )}

              {/* <button
                onClick={handleCopy}
                className="text-gray-500 hover:text-gray-800"
                title="Copy transaction hash"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#000000"
                >
                  <path d="M360-240q-29.7 0-50.85-21.15Q288-282.3 288-312v-480q0-29.7 21.15-50.85Q330.3-864 360-864h384q29.7 0 50.85 21.15Q816-821.7 816-792v480q0 29.7-21.15 50.85Q773.7-240 744-240H360Zm0-72h384v-480H360v480ZM216-96q-29.7 0-50.85-21.15Q144-138.3 144-168v-552h72v552h456v72H216Z" />
                </svg>
              </button> */}
            </div>
          );
        },
      },
    ],
    [walletId],
  );

  // Fetch transactions
  async function fetchReports(filters: FilterType) {
    setLoading(true);
    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getTransactions, filters);
    setLoading(false);

    if (res?.success && res?.body?.data) {
      setTotalPageCount(res?.body?.pagination?.totalItems ?? 0);
      setReports(res?.body?.data);
    }
  }

  // Fetch data when filters or pagination changes
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

  // Handle pagination changes
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ page, pageSize });
  };

  // Define row actions
  const getRowActions = (row: TransactionDetails) => {
    const actions = [];

    // Refund action for incoming transactions
    if (row.operationType === 1) {
      actions.push({
        label: "Refund",
        onClick: () => {
          router.push({
            pathname: "/app/transfers",
            query: {
              amount: row?.TransactionFee?.amount,
              assetId: row?.assetId,
              sourceAddress: row?.sourceAddress,
            },
          });
        },
        renderCustom: () => (
          <div className="cursor-pointer p-2 text-[#1AD598]">Refund</div>
        ),
      });
    }

    // Download action for specific operation type
    if (row.operationType === 5) {
      actions.push({
        label: "Download",
        onClick: () => {
          onDownloadClick?.(row);
        },
        className: "rounded-md bg-white p-4 shadow-md",
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

export default TransactionHistoryTable;
