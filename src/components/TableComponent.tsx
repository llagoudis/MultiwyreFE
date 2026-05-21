import { Tab } from "@headlessui/react";
import { Fade, MenuItem, Paper, Popper, Select } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import ReactDOMServer from "react-dom/server";
import { useForm } from "react-hook-form";
import Download from "~/assets/general/download.svg";
import { base_64_logo } from "~/common/images";
import { bigNumber, formatDate } from "~/helpers/helper";
import useDashboard from "~/hooks/useDashboard";
import { getExchangeTxns, getTransactions } from "~/service/api/transaction";
import { fetchUserById } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import useGlobalStore from "~/store/useGlobalStore";

import { getAllAssets } from "~/service/api/accounts";
import ModalWindow from "./common/ModalWindow";
import ReconciliationReportOTC from "./table-html-templates/ReconciliationReportOTC";
import ReconciliationReportOTCsafari from "./table-html-templates/ReconciliationReportOTCsafari";
import StatementReport from "./table-html-templates/StatementReport";
import StatementReport_Trade from "./table-html-templates/StatementReport_Trade";
import StatementReport_Trade_Safari from "./table-html-templates/StatementReport_Trade_Safari";
import TradeHistoryTableTable from "./TradeHistoryTable";
import TransactionHistoryTable from "./TransactionHistoryTable";

interface filterType {
  label: string;
  name: string;
}

interface downloadType {
  label: string;
  action: () => void;
  image?: string;
  disabled: boolean;
}

interface TableComponentProps {
  selectedCurrency?: string;
  selectedTransaction?: string;
  startDate?: string;
  endDate?: string;
  isDashboard?: boolean;
  isReports?: boolean;
  onDownloadClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    row: TransactionDetails,
  ) => void;
  onFiltersReady?: (filters: filterType[]) => void;
  onTabChange?: (tabIndex: number) => void;
}

// interface reportHeaderval {
//   Date: string;
//   "Sender account": string;
//   "Receiver account": string;
//   "Transaction Type": string;
//   "Transaction Id": string;
//   "Client Id": string;
//   Alert: string;
//   "Transaction Fee": string;
//   "Exchange Fee": string;
//   "Debited amount": string;
//   Rate: string;
//   "Credited amount": string;
//   Balance: string;
//   Description: string;
// }

interface Params {
  id: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const TableComponent: React.FC<TableComponentProps> = ({
  selectedCurrency,
  selectedTransaction,
  startDate,
  endDate,
  isDashboard = false,
  isReports = false,
  onTabChange,
  // onDownloadClick,
  // onFiltersReady,
}) => {
  const Tabs = ["Transaction History", "Trading History"];
  const walletId = useDashboard()?.assets?.[0]?.walletId;
  const admin = useGlobalStore((state) => state.admin);
  const router = useRouter();
  const { handleSubmit, register } = useForm<FormData>();
  // const walletId = useDashboard()?.assets?.[0]?.walletId;
  const userId = useDashboard()?.azureId;

  // const [setReports] = useState<TransactionDetails[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [downloadEl, setDownloadEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
  const [openSavePDF, setOpenSavePDF] = React.useState(false);

  // const [totalPageCount, setTotalPageCount] = React.useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] =
    useState<string>("");
  const [startDateFilter, setStartDate] = useState<string>("");
  const [endDateFilter, setEndDate] = useState<string>("");

  const [assets, setAssets] = useState<Assets[]>([]);

  const [userAddress, setUserAddress] = useState({ address: "" });

  const [currentTabIndex, setCurrentTabIndex] = useState(
    router.query?.selectedIndex ? Number(router.query.selectedIndex) : 0,
  );

  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const [tabFilters, setTabFilters] = useState<Record<number, filterType[]>>({
    0: [],
    1: [],
    2: [],
  });

  const [tabVisibleColumns, setTabVisibleColumns] = useState<
    Record<number, string[]>
  >({
    0: [],
    1: [],
    2: [],
  });

  const currentFilters = tabFilters[currentTabIndex] ?? [];
  const currentVisibleColumns = tabVisibleColumns[currentTabIndex] ?? [];

  const handleFiltersReady = useCallback((tabIndex: number) => {
    return (filters: filterType[]) => {
      // Update filters for this tab
      setTabFilters((prev) => ({
        ...prev,
        [tabIndex]: filters,
      }));

      setTabVisibleColumns((prev) => {
        const currentColumns = prev[tabIndex] ?? [];

        if (currentColumns.length === 0) {
          return {
            ...prev,
            [tabIndex]: filters.map((f) => f.name),
          };
        }

        return prev;
      });
    };
  }, []);

  const onCheckboxChange = (column: string) => {
    setTabVisibleColumns((prev) => {
      const currentColumns = [...(prev[currentTabIndex] ?? [])];
      const index = currentColumns.indexOf(column);

      if (index > -1) {
        currentColumns.splice(index, 1);
      } else {
        currentColumns.push(column);
      }

      return {
        ...prev,
        [currentTabIndex]: currentColumns,
      };
    });
  };

  const fetchUserData = async (param: Params) => {
    try {
      const [res, error]: APIResult<any> = await ApiHandler(
        fetchUserById,
        param,
      );
      if (res?.body) {
        const { user } = res.body;
        const address = {
          address:
            "" +
            user.UserVerification.addressLine1 +
            ", " +
            user.UserVerification.addressLine2 +
            ", " +
            user.UserVerification.city +
            ", " +
            user.UserVerification.state +
            ", " +
            user.UserVerification.Country.name +
            ", " +
            user.UserVerification.postalCode,
        };
        setUserAddress((addr) => ({ ...addr, ...address }));
      }
      if (error) {
        console.error("error", error);
      }
    } catch (err) {
      console.error("error", err);
    }
  };

  const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.currentTarget && setAnchorEl(event?.currentTarget);
    setOpen((open) => !open);
  };

  const handleClickDownloadMenu = (
    event?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event?.currentTarget && setDownloadEl(event?.currentTarget);
    setDownloadMenuOpen((downloadMenuOpen) => !downloadMenuOpen);
  };

  const [loadingUserData, setLoadingUserData] = useState<boolean>(false);

  const convertToCSV = async () => {
    setIsDownloadingCSV(true);
    let csvData: Record<string, string | number>[];
    let headers: string[];
    let fileNameBase = "";

    const commonParams: FilterType = {
      pageSize: 1000000, // fetch all
      pageNumber: 0,
      fromDate: startDate,
      toDate: endDate,
    };

    if (selectedCurrency) commonParams.assetName = selectedCurrency;
    if (selectedTransaction) commonParams.operationType = selectedTransaction;

    try {
      switch (currentTabIndex) {
        case 0: {
          fileNameBase = "transaction_history";

          const [res] = await ApiHandler<{ data: TransactionDetails[] }>(
            getTransactions,
            commonParams,
          );

          const transactions = res?.body?.data ?? [];

          csvData = transactions.map((row) => {
            let type = "-";
            if (row.OperationType?.displayName === "Internal Transfer") {
              if (row.sourceId === walletId) {
                type = "Outgoing Transfer";
              } else if (row.destinationId === walletId) {
                type = "Incoming Transfer";
              }
            } else if (row.OperationType?.displayName === "Outgoing Transfer") {
              type = "Withdrawal";
            } else if (row.OperationType?.displayName === "Incoming Transfer") {
              type = "Deposit";
            }

            const fromAddress =
              row.operationType === 2
                ? row.sourceAddress
                : row.operationType === 1
                  ? row.destinationAddress
                  : "-";

            const toAddress =
              row.operationType === 1
                ? row.sourceAddress
                : row.operationType === 2
                  ? row.destinationAddress
                  : "-";

            const amount =
              row.operationType === 2
                ? `-${bigNumber(row?.TransactionFee?.amount)}`
                : row.operationType === 1
                  ? `+${bigNumber(row?.TransactionFee?.amount)}`
                  : "-";

            return {
              Date: formatDate(row.createdAt) ?? "-",
              Type: type,
              From: fromAddress ?? "-",
              To: toAddress ?? "-",
              Asset: row?.SourceAsset?.Asset?.name ?? row?.Asset?.name ?? "-",
              Amount: amount,
              Fee: bigNumber(row?.TransactionFee?.transactionFee ?? 0),
              Balance: bigNumber(row?.TransactionFee?.balance ?? 0),
              "Transaction Hash": row?.txHash ?? "-",
            };
          });

          headers = [
            "Date",
            "Type",
            "From",
            "To",
            "Asset",
            "Amount",
            "Fee",
            "Balance",
            "Transaction Hash",
          ];

          break;
        }

        case 1: {
          // === TRADE HISTORY ===
          fileNameBase = "trade_history";

          const [res] = await ApiHandler<{ data: TransactionDetails[] }>(
            getExchangeTxns,
            commonParams,
          );

          const trades = res?.body?.data ?? [];

          csvData = trades.map((row) => {
            // ---- Sender ----
            const senderAsset =
              row?.SourceAsset?.Asset?.name ?? row?.Asset?.name ?? "-";

            const senderAddress = row?.sourceAddress ?? "-";

            // ---- Receiver ----
            const receiverAsset =
              row?.DestinationAsset?.Asset?.name ?? row?.Asset?.name ?? "-";

            const receiverAddress =
              row?.operationType === 2 && row.assetId === "EUR"
                ? (row?.EuroTransaction?.IBAN ?? "-")
                : (row?.destinationAddress ?? "-");

            const amount = `${bigNumber(row?.TransactionFee?.amount)} ${
              row?.assetId ?? "-"
            }`;

            const exchangeFee = `${bigNumber(
              row?.TransactionFee?.exchangeFee ?? 0,
            )} ${row?.TransactionFee?.exchangeFeeCurrency ?? "-"}`;

            const transactionFee = `${bigNumber(
              row?.TransactionFee?.transactionFee ?? 0,
            )} ${row?.TransactionFee?.transactionFeeCurrency ?? "-"}`;

            const netAmount = `${bigNumber(
              row?.TransactionFee?.netAmount ?? 0,
            )} ${row?.destinationAssetId ?? "-"}`;

            const status =
              row?.status === "COMPLETED" || row?.status === "CONFIRMED"
                ? "Executed"
                : row?.status === "PENDING"
                  ? "Pending"
                  : "Failed";

            return {
              "Date and Time": formatDate(row.createdAt) ?? "-",
              "Sender Account": `${senderAsset} (${senderAddress})`,
              "Receiver Account": `${receiverAsset} (${receiverAddress})`,
              "Transaction ID": row?.transactionId ?? "-",
              Amount: amount,
              "Exchange fee": exchangeFee,
              "Transaction fee": transactionFee,
              "Net Amount": netAmount,
              Status: status,
            };
          });

          headers = [
            "Date and Time",
            "Sender Account",
            "Receiver Account",
            "Transaction ID",
            "Amount",
            "Exchange fee",
            "Transaction fee",
            "Net Amount",
            "Status",
          ];

          break;
        }

        default:
          console.warn("Unsupported tab index for CSV export");
          return;
      }

      if (csvData.length === 0) {
        alert("No data available to export for the selected period.");
        setDownloadMenuOpen(false);
        return;
      }

      // Build CSV with proper escaping
      const headerRow = headers.join(",");
      const rows = csvData.map((row) =>
        headers
          .map((header) => {
            const val = row[header];
            const str = String(val ?? "");
            // Escape double quotes and wrap in quotes
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(","),
      );

      const csvContent = [headerRow, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileNameBase}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV Export Error:", error);
      alert("Failed to generate CSV. Please try again.");
    } finally {
      setDownloadMenuOpen(false);
      setIsDownloadingCSV(false);
      setDownloadMenuOpen(false);
    }
  };

  const convertToPDF = () => {
    setOpenSavePDF((openSavePDF) => !openSavePDF);
    setDownloadMenuOpen((downloadMenuOpen) => !downloadMenuOpen);
  };

  const files: downloadType[] = [
    {
      label: "Download CSV",
      action: convertToCSV,
      image: Download,
      disabled: false,
    },
    {
      label: "Download PDF",
      action: convertToPDF,
      image: Download,
      disabled: false,
    },
  ];

  const companyLegalName = admin?.companyLegalName ?? "";
  const adminImage = admin?.profileImgLink ?? "";

  const [html2pdf, setHtml2pdf] = useState<any>(null);

  const params: Params = { id: userId };

  useEffect(() => {
    if (isReports) {
      setLoadingUserData(true);
      fetchUserData(params).finally(() => {
        setLoadingUserData(false);
      });
    }

    if (process.browser) {
      import("html2pdf.js")
        .then((module) => {
          setHtml2pdf(module);
        })
        .catch((error) => {
          console.error("Error importing html2pdf:", error);
        });
    }

    const getOperationType = async () => {
      const [res] = await getAllAssets();

      if (res !== null && "body" in res) {
        setAssets(res.body);
      }
    };

    getOperationType();
  }, []);

  // block scrolling when the modal window is open
  useEffect(() => {
    document.body.classList.toggle("overflow-y-hidden", openSavePDF ?? false);
  }, [openSavePDF]);

  const handleClickTrade_Download = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    row: TransactionDetails,
  ) => {
    console.log({ row });
    e?.preventDefault?.();

    const trxFeeCurrency = row?.TransactionFee?.transactionFeeCurrency;

    const isConversionRequiredForExchangeFee =
      row?.TransactionFee?.exchangeFeeCurrency !== trxFeeCurrency;

    const isConversionRequiredForBankingFee = false;

    const userAgent = window.navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

    const clientName = `${row?.User?.firstname} ${row?.User?.lastname}`;

    const values = {
      createdAt: row?.createdAt,
      toAssetId: row?.destinationAssetId,
      fromAssetId: row?.assetId,

      creditedAmount: row?.TransactionFee?.creditedAmount,
      debitedAmount: row?.TransactionFee?.debitedAmount,
      // fees
      bankingFeePercent: 0,
      bankingFeeCurrency: "",
      bankingFee: 0,

      exchangeFeePercent: 0,
      exchangeFee: row?.TransactionFee?.exchangeFee,
      exchangeFeeCurrency: row?.TransactionFee?.exchangeFeeCurrency,

      trxFeeCurrency: row?.TransactionFee?.transactionFeeCurrency,
      transactionFee: row?.TransactionFee?.transactionFee,

      clientRate: row?.TransactionFee?.clientRate,
      amountForExchange: row?.TransactionFee?.netAmount,
      netAmount: row?.TransactionFee?.creditedAmount,

      type: row?.TransactionFee?.type,
    };

    if (!isSafari) {
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-9999px"; // Off-screen
      container.style.left = "-9999px";
      container.style.pointerEvents = "none";
      container.style.zIndex = "0";
      document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      await new Promise((resolve) => {
        root.render(
          <ReconciliationReportOTC
            row={{
              ...values,
              clientName: clientName,
              adminEmail: admin?.email ?? "",
              companyLegalName,
              adminImage: base_64_logo,
              companyAddress: admin?.companyAddress ?? "",
              isConversionRequiredForBankingFee,
              isConversionRequiredForExchangeFee,
            }}
          />,
        );
        setTimeout(resolve, 500); // Wait for render
      });

      const canvas = await html2canvas(container, {
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        // orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      //  Manual download (better Safari compatibility)
      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${row?.User?.firstname ?? "report"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    } else {
      const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
        <ReconciliationReportOTCsafari
          row={{
            ...values,
            clientName: clientName,
            adminEmail: admin?.email ?? "",
            companyLegalName,
            adminImage: base_64_logo,
            companyAddress: admin?.companyAddress ?? "",
            isConversionRequiredForBankingFee,
            isConversionRequiredForExchangeFee,
          }}
        />,
      );

      // Create a new window
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
         
      </head>
      <body>
        ${htmlTemplate}
      </body>
    </html>
  `);

        win.document.close();
        win.focus();
        win.print();
      }
    }
  };

  const handleClickDownloadPDF = (
    rows: TransactionDetails[],
    currency: string,
    startDate: string,
    endDate: string,
  ) => {
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      const sortedRows = rows.slice().sort((a, b) => {
        const dateA = new Date(a.createdAt ?? "");
        const dateB = new Date(b.createdAt ?? "");
        return dateA.getTime() - dateB.getTime();
      });
      const userAgent = window.navigator.userAgent;
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      if (!isSafari) {
        try {
          const htmlTemplate = ReactDOMServer.renderToStaticMarkup(
            <StatementReport
              rows={sortedRows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={admin?.companyLegalName}
              adminImage={admin?.profileImgLink}
              address={userAddress.address}
            />,
          );
          const pdfOptions = {
            margin: [5, 0, 20, 0],
            filename: `${rows[0]?.User?.firstname}_transaction_report.pdf`,
            image: { type: "application/pdf", quality: 1.0 },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
            html2canvas: { scale: 1 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          };

          html2pdf
            .default()
            .from(htmlTemplate)
            .set(pdfOptions)
            .toPdf()
            .get("pdf")
            .then((pdf: any) => {
              const totalPages = pdf.internal.getNumberOfPages();
              for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(6);
                pdf.setTextColor(150);
                pdf.text(
                  pdf.internal.pageSize.getWidth() - 200,
                  pdf.internal.pageSize.getHeight() - 10,
                  admin?.companyAddress,
                );
                pdf.text(
                  pdf.internal.pageSize.getWidth() - 20,
                  pdf.internal.pageSize.getHeight() - 10,
                  `Page ${i} of ${totalPages}`,
                );
                pdf.line(
                  pdf.internal.pageSize.getWidth() - 201,
                  pdf.internal.pageSize.getHeight() - 13,
                  pdf.internal.pageSize.getWidth() - 9,
                  pdf.internal.pageSize.getHeight() - 13,
                  "S",
                );
              }
            })
            .save();
        } catch (error) {
          console.error("error: ", error);
        }
      } else {
        try {
          // Render the StatementReportSafari component to HTML
          const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
            <StatementReport
              rows={rows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={companyLegalName}
              adminImage={adminImage}
              address={userAddress.address}
            />,
          );

          setTimeout(() => {
            try {
              // Create a new window
              const win = window.open("", "_blank");

              if (win) {
                // Write HTML content to the new window
                win.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Statement Report</title>
                </head>
                <body>
                  <div style={width: 90%;}>
                  ${htmlTemplate}
                  </div>
                </body>
                </html>
                `);
                // Trigger printing
                win.print();
              }
            } catch (error) {
              // console.error("error", error);
            }
          });
        } catch (error) {
          // console.error("error", error);
        }
      }
    }
  };

  // TRADE
  const handleClickDownloadPDF_TRADE = (
    rows: TransactionDetails[],
    currency: string,
    startDate: string,
    endDate: string,
  ) => {
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      const sortedRows = rows.slice().sort((a, b) => {
        const dateA = new Date(a.createdAt ?? "");
        const dateB = new Date(b.createdAt ?? "");
        return dateA.getTime() - dateB.getTime();
      });
      const userAgent = window.navigator.userAgent;
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      if (!isSafari) {
        try {
          const htmlTemplate = ReactDOMServer.renderToStaticMarkup(
            <StatementReport_Trade
              rows={sortedRows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={admin?.companyLegalName}
              adminImage={admin?.profileImgLink}
              address={userAddress.address}
            />,
          );
          const pdfOptions = {
            margin: [5, 0, 20, 0],
            filename: `${rows[0]?.User?.firstname}_trade_report.pdf`,
            image: { type: "application/pdf", quality: 1.0 },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
            html2canvas: { scale: 1 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          };

          html2pdf
            .default()
            .from(htmlTemplate)
            .set(pdfOptions)
            .toPdf()
            .get("pdf")
            .then((pdf: any) => {
              const totalPages = pdf.internal.getNumberOfPages();
              for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(6);
                pdf.setTextColor(150);
                pdf.text(
                  pdf.internal.pageSize.getWidth() - 200,
                  pdf.internal.pageSize.getHeight() - 10,
                  admin?.companyAddress,
                );
                pdf.text(
                  pdf.internal.pageSize.getWidth() - 20,
                  pdf.internal.pageSize.getHeight() - 10,
                  `Page ${i} of ${totalPages}`,
                );
                pdf.line(
                  pdf.internal.pageSize.getWidth() - 201,
                  pdf.internal.pageSize.getHeight() - 13,
                  pdf.internal.pageSize.getWidth() - 9,
                  pdf.internal.pageSize.getHeight() - 13,
                  "S",
                );
              }
            })
            .save();
        } catch (error) {
          console.error("error: ", error);
        }
      } else {
        try {
          // Render the StatementReportSafari component to HTML
          const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
            <StatementReport_Trade_Safari
              rows={rows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={companyLegalName}
              adminImage={adminImage}
              address={userAddress.address}
            />,
          );

          setTimeout(() => {
            try {
              // Create a new window
              const win = window.open("", "_blank");

              if (win) {
                // Write HTML content to the new window
                win.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Statement Report</title>
                </head>
                <body>
                  <div style={width: 90%;}>
                  ${htmlTemplate}
                  </div>
                </body>
                </html>
                `);
                // Trigger printing
                win.print();
              }
            } catch (error) {
              // console.error("error", error);
            }
          });
        } catch (error) {
          // console.error("error", error);
        }
      }
    }
  };

  // Form
  interface FormData {
    currency: string;
    startDate: string;
    endDate: string;
  }

  const getTxnHistoryReports = async (
    currency = "",
    startDate = "",
    endDate = "",
  ) => {
    const paramsQuery: FilterType = {
      pageSize: 1000000000,
      pageNumber: 0,
      fromDate: startDate,
      toDate: endDate,
    };

    if (currency) paramsQuery.assetName = currency;

    const [res]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getTransactions, paramsQuery);

    const filteredReports = res?.body.data ?? [];
    let sortedTransactions: TransactionDetails[] = [];
    if (filteredReports.length === 0) {
      setErrorMessage("No transactions were found during this period!");
      return;
    } else {
      // sort by id
      sortedTransactions = filteredReports
        .slice()
        .filter((value) => {
          return (
            value.status === "COMPLETED" &&
            !value.note?.toUpperCase().includes("SWEEP_TRANSACTION") &&
            !value.note?.toUpperCase().includes("COMMISSION_TRANSACTION") &&
            !value.note?.toUpperCase().includes("CLIENT_TO_MASTER_EXCHANGE") &&
            !value.note?.toUpperCase().includes("MASTER_TO_CLIENT_EXCHANGE") &&
            !value.note?.toUpperCase().includes("GAS_STATION")
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt ?? "");
          const dateB = new Date(b.createdAt ?? "");
          return dateA.getTime() - dateB.getTime();
        });
    }
    setOpenSavePDF(false);
    handleClickDownloadPDF(sortedTransactions, currency, startDate, endDate);
  };

  const getTradeHistoryReports = async (
    currency = "",
    startDate = "",
    endDate = "",
  ) => {
    const paramsQuery: FilterType = {
      pageSize: 1000000000,
      pageNumber: 0,
      fromDate: startDate,
      toDate: endDate,
    };

    if (currency) paramsQuery.assetName = currency;

    const [res]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getExchangeTxns, paramsQuery);

    const filteredReports = res?.body.data ?? [];
    let sortedTransactions: TransactionDetails[] = [];
    if (filteredReports.length === 0) {
      setErrorMessage("No transactions were found during this period!");
      return;
    } else {
      // sort by id
      sortedTransactions = filteredReports.sort((a, b) => {
        const dateA = new Date(a.createdAt ?? "");
        const dateB = new Date(b.createdAt ?? "");
        return dateA.getTime() - dateB.getTime();
      });
    }
    setOpenSavePDF(false);

    handleClickDownloadPDF_TRADE(
      sortedTransactions,
      currency,
      startDate,
      endDate,
    );
  };

  const onSubmit = (data: any) => {
    setErrorMessage("");
    if (new Date(data.startDate) > new Date(data.endDate)) {
      setErrorMessage("The start date cannot be longer than the end date!");
      return;
    }

    if (currentTabIndex === 0)
      getTxnHistoryReports(data.currency, data.startDate, data.endDate);

    if (currentTabIndex === 1)
      getTradeHistoryReports(data.currency, data.startDate, data.endDate);
  };

  const onError = (err: any) => {
    setErrorMessage(err);
  };

  const onChangeCurrency = (event: any) => {
    setSelectedCurrencyFilter(event.target.value);
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-lg font-bold">Recent activity</div>
      <div>
        <Tab.Group
          defaultIndex={
            router.query?.selectedIndex ? Number(router.query.selectedIndex) : 0
          }
          onChange={(index) => {
            setCurrentTabIndex(index);

            if (onTabChange) {
              onTabChange(index);
            }
          }}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <Tab.List className="flex items-center justify-center gap-2 ">
              {Tabs.map((item) => (
                <Tab
                  key={item}
                  className={({ selected }) =>
                    classNames(
                      " px-2 pb-5 pt-2.5 text-sm leading-5",
                      " focus:outline-none",

                      selected
                        ? "border-b-[3px] border-pink-500 pb-4 font-bold text-pink-600"
                        : " font-medium text-slate-600 hover:text-black",
                    )
                  }
                >
                  <p className=" w-fit">{item}</p>
                </Tab>
              ))}
            </Tab.List>
            <div className="flex gap-3 ">
              {isDashboard ? null : (
                <button
                  type="button"
                  onClick={handleClickDownloadMenu}
                  disabled={loadingUserData}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm  text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                 <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.4565 7.55273C12.3317 7.55273 12.212 7.60231 12.1237 7.69057C12.0355 7.77882 11.9859 7.89851 11.9859 8.02332V9.63038C11.9859 10.0092 11.8354 10.3725 11.5676 10.6403C11.2997 10.9081 10.9364 11.0586 10.5576 11.0586H2.36941C1.99062 11.0586 1.62734 10.9081 1.3595 10.6403C1.09165 10.3725 0.941176 10.0092 0.941176 9.63038V8.02332C0.941176 7.89851 0.891597 7.77882 0.803344 7.69057C0.715092 7.60231 0.595396 7.55273 0.470588 7.55273C0.34578 7.55273 0.226084 7.60231 0.137832 7.69057C0.0495797 7.77882 0 7.89851 0 8.02332V9.63038C0.000622922 10.2586 0.250457 10.8609 0.694673 11.3051C1.13889 11.7493 1.7412 11.9992 2.36941 11.9998H10.5576C11.1859 11.9992 11.7882 11.7493 12.2324 11.3051C12.6766 10.8609 12.9264 10.2586 12.9271 9.63038V8.02332C12.9271 7.89851 12.8775 7.77882 12.7892 7.69057C12.701 7.60231 12.5813 7.55273 12.4565 7.55273Z" fill="black"/>
<path d="M6.12926 8.92706C6.173 8.97117 6.22505 9.00618 6.2824 9.03007C6.33974 9.05396 6.40125 9.06626 6.46337 9.06626C6.5255 9.06626 6.587 9.05396 6.64435 9.03007C6.7017 9.00618 6.75374 8.97117 6.79749 8.92706L9.47514 6.24941C9.54985 6.15951 9.58843 6.04503 9.58336 5.92825C9.5783 5.81147 9.52995 5.70075 9.44774 5.61766C9.36553 5.53456 9.25533 5.48504 9.13861 5.47873C9.02189 5.47242 8.907 5.50978 8.81631 5.58353L6.93396 7.46588V0.470588C6.93396 0.34578 6.88438 0.226084 6.79613 0.137832C6.70788 0.0495797 6.58818 0 6.46337 0C6.33857 0 6.21887 0.0495797 6.13062 0.137832C6.04236 0.226084 5.99278 0.34578 5.99278 0.470588V7.45882L4.11043 5.57647C4.02213 5.48817 3.90237 5.43856 3.77749 5.43856C3.65261 5.43856 3.53285 5.48817 3.44455 5.57647C3.35625 5.66477 3.30664 5.78453 3.30664 5.90941C3.30664 6.03429 3.35625 6.15405 3.44455 6.24235L6.12926 8.92706Z" fill="black"/>
</svg>

                  Download
                </button>
              )}
              <button
                type="button"
                onClick={handleClick}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm  text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
               <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.185 0H1.815C1.33404 0.001337 0.873152 0.195523 0.533059 0.540122C0.192966 0.884721 0.00131952 1.35171 0 1.83905V9.19525C0.00131952 9.68258 0.192966 10.1496 0.533059 10.4942C0.873152 10.8388 1.33404 11.033 1.815 11.0343H7V11.9868H5.5C5.36739 11.9868 5.24021 12.0401 5.14645 12.1351C5.05268 12.2301 5 12.359 5 12.4934C5 12.6277 5.05268 12.7566 5.14645 12.8516C5.24021 12.9466 5.36739 13 5.5 13L9.5 12.9544C9.63261 12.9544 9.75979 12.901 9.85355 12.806C9.94732 12.711 10 12.5821 10 12.4478C10 12.3134 9.94732 12.1846 9.85355 12.0895C9.75979 11.9945 9.63261 11.9412 9.5 11.9412H8V11.0343H13.185C13.666 11.033 14.1268 10.8388 14.4669 10.4942C14.807 10.1496 14.9987 9.68258 15 9.19525V1.83905C14.9987 1.35171 14.807 0.884721 14.4669 0.540122C14.1268 0.195523 13.666 0.001337 13.185 0ZM14 9.19525C14 9.41426 13.9141 9.62431 13.7613 9.77917C13.6084 9.93404 13.4012 10.021 13.185 10.021H1.815C1.59885 10.021 1.39155 9.93404 1.23871 9.77917C1.08587 9.62431 1 9.41426 1 9.19525V1.83905C1 1.62003 1.08587 1.40999 1.23871 1.25512C1.39155 1.10025 1.59885 1.01325 1.815 1.01325H13.185C13.4012 1.01325 13.6084 1.10025 13.7613 1.25512C13.9141 1.40999 14 1.62003 14 1.83905V9.19525Z" fill="black"/>
</svg>

                Display
              </button>
            </div>
          </div>
          <Tab.Panels className="">
            <Tab.Panel>
              {" "}
              <TransactionHistoryTable
                selectedCurrency={selectedCurrency}
                selectedTransaction={selectedTransaction}
                startDate={startDate}
                endDate={endDate}
                visibleColumns={currentVisibleColumns}
                // onDownloadClick={onDownloadClick}
                onFiltersReady={handleFiltersReady(0)}
              />
            </Tab.Panel>
            <Tab.Panel>
              <TradeHistoryTableTable
                selectedCurrency={selectedCurrency}
                selectedTransaction={selectedTransaction}
                startDate={startDate}
                endDate={endDate}
                visibleColumns={currentVisibleColumns}
                onDownloadClick={(e, row) => {
                  if (e && row) {
                    handleClickTrade_Download(e, row);
                  }
                }}
                onFiltersReady={handleFiltersReady(1)}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement={"bottom-end"}
          transition
          sx={{
            zIndex: "99",
          }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxHeight: "40vh",
                  overflowY: "scroll",
                }}
              >
                {currentFilters.map((item, i) => (
                  <div key={i} className="flex items-center px-2 ">
                    <input
                      type="checkbox"
                      checked={
                        currentVisibleColumns.includes(item.name) || false
                      }
                      onChange={() => {
                        onCheckboxChange(item.name);
                      }}
                      className={
                        `rounded_checkbox  ` + "cursor-pointer accent-[#1CBDAB]"
                      }
                      id={item.name}
                    />
                    <label
                      className="cursor-pointer px-2"
                      htmlFor={`${item.name}`}
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </Paper>
            </Fade>
          )}
        </Popper>

        <Popper
          open={downloadMenuOpen}
          anchorEl={downloadEl}
          placement={"bottom-end"}
          transition
          sx={{
            zIndex: "99",
          }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxHeight: "40vh",
                }}
              >
                {files.map((item, i) => (
                  <div key={i} className="flex items-center px-2">
                    <button
                      disabled={
                        item.label === "Download CSV" && isDownloadingCSV
                      }
                      onClick={item.action}
                      className={`flex items-center gap-2 ${
                        isDownloadingCSV && item.label === "Download CSV"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                    >
                      <Image src={Download} alt="Download" />
                      <span>
                        {item.label === "Download CSV" && isDownloadingCSV
                          ? "Downloading..."
                          : item.label}
                      </span>
                    </button>
                  </div>
                ))}
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>

      {openSavePDF && (
        <ModalWindow
          title="Download PDF"
          message="Please fill in all fields and press the Download PDF button to save the report as a PDF file."
          onClose={() => {
            setOpenSavePDF(false);
          }}
          errorMessage={errorMessage}
          showCloseButtonInTitle
        >
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <div>
              <div>Currency</div>
              <Select
                required
                {...register("currency")}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e5e7eb",
                  },
                }}
                MenuProps={{
                  style: { maxWidth: "200px" },
                }}
                value={selectedCurrencyFilter}
                size="small"
                onChange={onChangeCurrency}
                className="mb-2 mt-1 w-full rounded-md outline outline-1 outline-[#c4c4c4]"
              >
                {assets.map(
                  (item) =>
                    item.name !== "Any" && (
                      <MenuItem key={item.name} value={item?.fireblockAssetId}>
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
              <div>Start date</div>
              <input
                {...register("startDate")}
                required
                type="date"
                className=" mb-2 mt-1 w-full rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                max={endDate}
              />
            </div>
            <div>
              <div>End date</div>
              <input
                {...register("endDate")}
                required
                type="date"
                className=" mb-2 mt-1 w-full  rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                value={endDateFilter}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            <button
              type="submit"
              className="w-full justify-center rounded-md bg-gradient-to-r from-blue-500 to-purple-700px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Download PDF
            </button>
          </form>
        </ModalWindow>
      )}
    </div>
  );
};

export default TableComponent;
