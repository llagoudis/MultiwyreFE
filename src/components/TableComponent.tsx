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
import MuiButton from "./MuiButton";
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
    <div className="">
      <div className="mb-4 pl-2 text-lg font-bold">Recent activity</div>
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
                      " px-2 pb-5 pt-2.5 text-sm leading-5 text-black",
                      " focus:outline-none",

                      selected
                        ? "border-b-[3px] border-[blue] pb-4  font-bold text-black"
                        : " font-medium text-black hover:text-black",
                    )
                  }
                >
                  <p className=" w-fit">{item}</p>
                </Tab>
              ))}
            </Tab.List>
            <div className="flex gap-4 ">
              {isDashboard ? null : (
                <MuiButton
                  name="Download"
                  background="linear-gradient(to right, #3B82F6, #8B5CF6) !important"
                  color="white"
                  onClick={handleClickDownloadMenu}
                  disabled={loadingUserData}
                >
                  <span className="text-md pl-2 font-semibold">&#9013;</span>
                </MuiButton>
              )}
              <MuiButton
                name="Display"
                background="linear-gradient(to right, #3B82F6, #8B5CF6) !important"
                color="white"
                onClick={handleClick}
              >
                <span className="text-md pl-2 font-semibold">&#9013;</span>
              </MuiButton>
            </div>
          </div>
          <Tab.Panels className="mt-2">
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
