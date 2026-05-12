import Image from "next/image";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import ReactDOMServer from "react-dom/server";
import Download from "~/assets/general/download.svg";
//   import MuiButton from "./MuiButton";
import {
  Box,
  Fade,
  MenuItem,
  Paper,
  Popper,
  Select,
  Stack,
  TablePagination,
} from "@mui/material";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { bigNumber, formatDate, getStatusColor } from "~/helpers/helper";
import useDashboard from "~/hooks/useDashboard";
import { fetchUserById } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { getAllAssets } from "~/service/api/accounts";
import { getEcomTransactions } from "~/service/api/transaction";
import useGlobalStore from "~/store/useGlobalStore";
import LoaderIcon from "../LoaderIcon";
import MuiButton from "../MuiButton";
import ModalWindow from "../common/ModalWindow";
import StatusText from "../common/StatusText";
import StatementReportProject from "../table-html-templates/StatementReportProject";

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

interface RowSpec {
  label: string;
  name: string;
  key?: keyof EcomTransactionDetails;
  type?: string;
  className?: string;
  getValue?: (row: EcomTransactionDetails) => string | number;
}

interface OperationType {
  id: number;
}

interface EcomTransactionDetails extends CommonKeys {
  assetName: string;
  userId: string;
  transactionId: string;
  assetId: string;
  OperationType: OperationType;
  sourceId: string;
  destinationId: string;
  sourceType: string;
  destinationType: string;
  orderType: string;
  sourceAddress: string;
  destinationAddress: string;
  subStatus: string;
  txHash: string;
  numOfConfirmations: string;
  note: string;
  operation: string;
  Asset: Assets;
  User?: Partial<User>;
  TransactionFee: TransactionFees;
  EuroTransaction: EuroTransaction;
  SourceAsset: Partial<UserAssets> & Partial<{ Asset: Assets }>;
  DestinationAsset: Partial<UserAssets> & Partial<{ Asset: Assets }>;
  fromAddress: string;
  toAddress: string;
  transactiontype: string;
  customerId: string;
  customerEmail?: string;
  recoveryEmail?: string;
  status: string;
  exactAmount: string;
  requestedAmount: string;
  requestedAssetId?: string;
  amount: string;
  fee: string;
  color: string;
  transactionHash?: string;
  hasAutoConversion: boolean;
  networkFee: string;
  EcomTransaction: EcomTransaction;
  widgetNumber: string;
  orderId: string;
}

type EcomTransaction = {
  transactionId: string;
  hasAutoConversion: boolean;
  amount: string;
  assetId: string;
  Asset: Assets;
  toAddress: string;
};

interface EcomRowSpec {
  label: string;
  name: string;
  key?: keyof EcomTransactionDetails;
  type?: string;
  className?: string;
  getValue?: (row: EcomTransactionDetails) => string | number;
}

interface TableComponentProps {
  selectedCurrency: string;
  selectedTransaction: string;
  selectedClientId: string;
  startDate: string;
  endDate: string;
}

interface reportHeaderval {
  Date: string;
  "Client ID": string;
  "Unique ID": string;
  "Order ID": string;
  "Customer E-Mail": string;
  Status: string;
  // Fee: string;
  "Credited Amount": string;
  "Fiat Amount": string;
  Fee: string;

  "Debited Amount": string;
  "Transaction Type": string;
  "Sender account": string;
  "Receiver account": string;
  "Transaction Id": string;
  // Description: string;
}

interface Params {
  id: string;
}

const TableComponent: React.FC<TableComponentProps> = ({
  selectedCurrency,
  selectedTransaction,
  selectedClientId,
  startDate,
  endDate,
}) => {
  const admin = useGlobalStore((state) => state.admin);
  const router = useRouter();
  const { handleSubmit, register } = useForm<FormData>();
  const isDashboard = router.pathname.includes("dashboard");
  const isReports = router.pathname.includes("reports");
  const walletId = useDashboard()?.assets?.[0]?.walletId;
  const userId = useDashboard()?.azureId;
  const userName = useDashboard()?.firstname;

  const [reports, setReports] = useState<EcomTransactionDetails[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [downloadEl, setDownloadEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
  const [openSavePDF, setOpenSavePDF] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [totalPageCount, setTotalPageCount] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] =
    useState<string>("");
  const [startDateFilter, setStartDate] = useState<string>("");
  const [endDateFilter, setEndDate] = useState<string>("");

  const [assets, setAssets] = useState<Assets[]>([]);

  const [userAddress, setUserAddress] = useState({ address: "" });

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });

  const handleChangePagination = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    const pageSize = parseInt(event.target.value);
    setPagination({ ...pagination, pageSize });
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
        console.log("error", error);
      }
    } catch (err) {
      console.log("error", err);
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

  const [actionMenuEl, setActionMenuEl] =
    React.useState<HTMLButtonElement | null>(null);
  const actionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionMenuEl(event.currentTarget);
  };
  const actionClose = () => {
    setActionMenuEl(null);
  };
  const actionOpen = Boolean(actionMenuEl);
  const id = actionOpen ? "simple-popover" : undefined;

  // filter options
  const filters: filterType[] = [
    { label: "Date and Time", name: "date" },
    { label: "Client ID ", name: "customerId" },
    { label: "Customer E-Mail", name: "customerEmail" },
    { label: "Unique ID", name: "widgetNumber" },
    { label: "Order ID", name: "orderId" },
    { label: "Status", name: "status" },
    { label: "Fee", name: "transactionFee" },
    { label: "Fiat Amount", name: "requestedAmount" },
    { label: "Sender Account ", name: "senderaccount" },
    { label: "Receiver Account", name: "receiveraccount" },
    { label: "Transaction Type", name: "transactiontype" },
    { label: "Transaction ID ", name: "transactionId" },
    // { label: "Exchange fee", name: "exchangeFee" },
    { label: "Debited amount", name: "debitedAmount" },
    // { label: "Rate", name: "rate" },
    { label: "Credited amount", name: "creditedAmount" },
    // { label: "Balance", name: "balance" },
    // { label: "Description", name: "description" },
  ];

  const [visibleColumns, setCheckedItems] = useState<string[]>([
    "date",
    "customerId",
    "widgetNumber",
    "orderId",
    "customerEmail",
    "status",
    "senderaccount",
    "receiveraccount",
    "transactiontype",
    "transactionId",
    "transactionFee",
    "exactAmount",
    "requestedAmount",
    "amount",
    // "description",
  ]);

  const onCheckboxChange = (column: string) => {
    setCheckedItems((prev) => {
      const next = [...prev];
      if (next.includes(column)) {
        next.splice(next.indexOf(column), 1);
      } else {
        next.push(column);
      }
      return next;
    });
  };
  const navigate = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  const getCryptoColor = (
    cryptoAmount: number,
    receivedCrypto: number,
  ): string => {
    if (cryptoAmount === 0) {
      return "black";
    } else if (receivedCrypto >= cryptoAmount * 1.02) {
      return "#00bb6c"; // Green
    } else if (receivedCrypto < cryptoAmount * 0.98) {
      return "red";
    } else {
      return "black";
    }
  };

  const getAssetSymbol = (id: string): string => {
    if (id === "EUR") {
      return "€";
    } else if (id === "USD") {
      return "$";
    } else {
      return "";
    }
  };

  const TableRows: EcomRowSpec[] = useMemo(
    () => [
      {
        label: "Date and Time",
        name: "date",
        className: "font-bold",
        getValue: (row) => formatDate(row.createdAt) ?? "-",
      },
      {
        label: "Client ID",
        name: "customerId",
        key: "customerId",
        getValue: (row) => row?.customerId ?? "-",
      },
      {
        label: "Customer E-Mail",
        name: "customerEmail",
        key: "customerEmail",
        getValue: (row) => row?.recoveryEmail ?? "-",
      },
      {
        label: "Unique ID",
        name: "widgetNumber",
        key: "widgetNumber",
        getValue: (row) => row?.widgetNumber ?? "-",
      },

      {
        label: "Order ID",
        name: "orderId",
        key: "orderId",
        getValue: (row) => row?.orderId ?? "-",
      },

      {
        label: "Status",
        name: "status",
        key: "status",
        getValue: (row) => row.status ?? "-",
      },

      {
        label: "Fiat Amount",
        name: "requestedAmount",
        getValue: (row) => row?.requestedAmount ?? "---",
      },

      {
        label: "Fee",
        name: "transactionFee",
        getValue: (row) => {
          const fee = row.networkFee ?? "--";
          if (fee !== "--") {
            const formattedFee = parseFloat(fee).toFixed(6);
            return formattedFee;
          }
          return fee;
        },
      },

      {
        label: "Credited Amount",
        name: "creditedAmount",
        getValue: (row) => {
          return row.OperationType.id === 2
            ? "---"
            : row.exactAmount
              ? row.exactAmount
              : "--";
        },
      },

      {
        label: "Debited Amount",
        name: "debitedAmount",
        getValue: (row: EcomTransactionDetails): string => {
          return row.OperationType.id === 1 ? "---" : row.amount;
        },
      },
      {
        label: "Transaction Type",
        name: "transactiontype",
        key: "transactiontype",
        className: "font-bold",
        getValue: (row) => {
          return row.OperationType.id === 2
            ? "Outgoing Transfer"
            : row.OperationType.id === 1
              ? "Incoming Transfer"
              : "Internal Transfer";
        },
      },
      {
        label: "Sender Account ",
        name: "senderaccount",
        type: "image",
        className: "font-bold",
      },
      {
        label: "Receiver Account",
        name: "receiveraccount",
        type: "image",
        className: "font-bold",
      },
      {
        label: "Transaction ID",
        name: "transactionId",
        key: "transactionId",
        className: "font-bold",
        getValue: (row) => row?.transactionId ?? "-",
      },
      // {
      //   label: "Description",
      //   name: "description",
      //   // key: "note",
      //   className: "font-bold",
      //   getValue: (row) =>
      //     row.operation === "EXCHANGE"
      //       ? `Exchange - Order ${row?.TransactionFee?.type} - ${row?.TransactionFee?.clientRate} @ ${row?.orderType}`
      //       : row?.note,

      //   // getValue: (row) => `Exchange - Order `,
      // },
    ],
    [],
  );

  const renderKey = (rowSpec: EcomRowSpec, row: EcomTransactionDetails) => {
    if (rowSpec.type === "image") {
      return (
        <div className="flex  items-center gap-2 py-2 pr-2">
          {row?.Asset?.icon && (
            <Image
              className="h-8 w-8 rounded object-cover duration-300"
              src={
                (rowSpec.name.includes("sender")
                  ? row?.SourceAsset?.Asset?.icon
                  : row?.hasAutoConversion
                    ? row?.EcomTransaction?.Asset?.icon
                    : row?.Asset?.icon) ?? row?.Asset?.icon
              }
              alt="asset"
              width={20}
              height={20}
            />
          )}
          <div className="flex flex-col items-start">
            <span className=" text-xl font-semibold">
              {(rowSpec.name.includes("sender")
                ? row?.SourceAsset?.Asset?.name
                : row?.hasAutoConversion
                  ? row?.EcomTransaction?.assetId
                  : row?.Asset?.name) ?? row?.Asset?.name}
            </span>
            <span className=" text-sm font-semibold leading-[1.3rem] text-[#809FB8]">
              {rowSpec.name.includes("sender")
                ? (row.fromAddress ?? "--")
                : row?.EcomTransaction?.toAddress
                  ? row?.EcomTransaction?.toAddress
                  : (row.toAddress ?? "--")}
            </span>
          </div>
        </div>
      );
    }

    if (rowSpec?.getValue) {
      const value = rowSpec.getValue(row);
      if (rowSpec.name === "amount") {
        const cryptoAmount = parseFloat(row?.exactAmount ?? "0");
        const receivedCrypto = parseFloat(row?.amount ?? "0");
        const color = getCryptoColor(cryptoAmount, receivedCrypto);
        return <span style={{ color }}>{value}</span>;
      } else if (rowSpec.name === "status") {
        const color = getStatusColor(row?.status);
        return (
          <StatusText color={color}>
            {value.toString().toLowerCase()}
          </StatusText>
        );
      } else if (
        rowSpec.name === "requestedAmount" &&
        row.requestedAmount != ""
      ) {
        return (
          <span>
            {value} {row.requestedAssetId}
          </span>
        );
      }
      return value;
    }

    if (rowSpec?.key) {
      return String(row[rowSpec?.key]) ?? "-";
    }
    return "-";
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(false);

  async function fetchReports(filters: FilterType) {
    setLoading(true);
    const [res, error]: APIResult<{
      data: EcomTransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getEcomTransactions, filters);
    setLoading(false);

    if (res?.success && res?.body?.data) {
      setTotalPageCount(res?.body?.pagination?.totalItems ?? 0);
      setReports(res?.body?.data);

      console.log("setReports", res?.body?.data);
    }
  }

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: startDate,
      toDate: endDate,
    };

    if (selectedCurrency) paramsQuery.assetId = selectedCurrency;
    if (selectedTransaction) paramsQuery.operationType = selectedTransaction;
    if (selectedClientId) paramsQuery.customerId = selectedClientId;

    void fetchReports(paramsQuery);
  }, [
    pagination,
    selectedCurrency,
    selectedTransaction,
    selectedClientId,
    startDate,
    endDate,
  ]);

  const convertToCSV = async () => {
    const paramsQuery: FilterType = {
      pageSize: totalPageCount,
      pageNumber: 0,
      fromDate: startDate,
      toDate: endDate,
    };

    if (selectedCurrency) paramsQuery.assetId = selectedCurrency;
    if (selectedTransaction) paramsQuery.operationType = selectedTransaction;
    if (selectedClientId) paramsQuery.clientId = selectedClientId;

    const [res, error]: APIResult<{
      data: EcomTransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getEcomTransactions, paramsQuery);

    const filteredReports = res?.body?.data ?? [];
    const reportHeaderval: reportHeaderval[] = [];
    filteredReports?.map((item: any) => {
      reportHeaderval.push({
        Date: item?.createdAt,
        "Client ID": item?.customerId ?? "--",
        "Unique ID": item?.widgetNumber ?? "--",
        "Order ID": item?.orderId ?? "--",
        "Customer E-Mail": item?.recoveryEmail ?? "--",
        Status: item?.status ?? "--",
        Fee: String(bigNumber(item?.fee)),
        "Credited Amount":
          item?.OperationType.id === 2
            ? "---"
            : String(bigNumber(item?.exactAmount)),
        "Fiat Amount": String(bigNumber(item?.requestedAmount)),
        "Debited Amount":
          item?.OperationType.id === 1
            ? "---"
            : String(bigNumber(item?.amount)),
        "Transaction Type": item?.OperationType?.displayName,
        "Sender account": item?.fromAddress,
        "Receiver account": item?.toAddress,
        "Transaction Id": item?.transactionId,
        // Description:
        //   item.operation === "EXCHANGE"
        //     ? `Exchange - Order ${item?.TransactionFee?.type} - ${item?.TransactionFee?.clientRate} @ ${item?.orderType}`
        //     : item?.note,
      });
    });
    const headerRow = reportHeaderval[0]
      ? Object.keys(reportHeaderval[0]).join(",")
      : "";
    const csvContent =
      "data:text/csv; charset=utf-8,\uFEFF" +
      headerRow +
      "\n" +
      reportHeaderval.map((row) => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reports.csv");
    document.body.appendChild(link);
    link.click();
    setDownloadMenuOpen((downloadMenuOpen) => !downloadMenuOpen);
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

  const [checked, setChecked] = React.useState<{ e: any; id: any } | null>(
    null,
  );

  const handleChange = (e: any, id: any) => {
    setChecked((prev) => (prev?.id === id ? null : { e, id }));
  };

  const icon = (
    <Paper className=" cursor-pointer">
      <Box className="p-2 text-[#1AD598]">Refund</Box>
    </Paper>
  );
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
        console.log("res.body", res.body);
      }
    };

    getOperationType();
  }, []);

  // block scrolling when the modal window is open
  useEffect(() => {
    document.body.classList.toggle("overflow-y-hidden", openSavePDF ?? false);
  }, [openSavePDF]);

  const handleClickDownloadPDF = (
    rows: EcomTransactionDetails[],
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
            <StatementReportProject
              rows={sortedRows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={admin?.companyLegalName}
              adminImage={admin?.profileImgLink}
              address={userAddress.address}
              isBrowser={true}
            />,
          );
          const pdfOptions = {
            margin: [5, 0, 20, 0],
            filename: `${userName}_statement_report.pdf`,
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
          console.log("Saving PDF error.", error);
        }
      } else {
        try {
          // Render the StatementReportSafari component to HTML
          const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
            <StatementReportProject
              rows={rows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={companyLegalName}
              adminImage={adminImage}
              address={userAddress.address}
              isBrowser={false}
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
              console.log("error", error);
            }
          });
        } catch (error) {
          console.error("error generating PDF:", error);
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

  const getReportData = async (currency = "", startDate = "", endDate = "") => {
    const paramsQuery: FilterType = {
      pageSize: 1000000000,
      pageNumber: 0,
      fromDate: startDate,
      toDate: endDate,
    };

    if (currency) paramsQuery.assetId = currency;

    const [res, error]: APIResult<{
      data: EcomTransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getEcomTransactions, paramsQuery);

    const filteredReports = res?.body.data ?? [];
    let sortedTransactions: EcomTransactionDetails[] = [];
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
    handleClickDownloadPDF(sortedTransactions, currency, startDate, endDate);
  };

  const onSubmit = (data: any) => {
    setErrorMessage("");
    if (new Date(data.startDate) > new Date(data.endDate)) {
      setErrorMessage("The start date cannot be longer than the end date!");
      return;
    }
    getReportData(data.currency, data.startDate, data.endDate);
  };

  const onError = (err: any) => {
    setErrorMessage(err);
  };

  const onChangeCurrency = (event: any) => {
    setSelectedCurrencyFilter(event.target.value);
  };

  return (
    <div className="">
      <div className="  flex items-center justify-between">
        <div className="text-lg font-bold">Recent activity</div>

        <div className="flex gap-4">
          {isDashboard ? null : (
            <MuiButton
              name="Download"
              background="#ffffff"
              color="#C1922E"
              onClick={handleClickDownloadMenu}
              disabled={loadingUserData}
            >
              <span className="text-md pl-2 font-semibold">&#9013;</span>
            </MuiButton>
          )}
          <MuiButton
            name="Display"
            background="#ffffff"
            color="#C1922E"
            onClick={handleClick}
          >
            <span className="text-md pl-2 font-semibold">&#9013;</span>
          </MuiButton>
        </div>

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
                {filters.map((item, i) => (
                  <div key={i} className="flex items-center px-2 ">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(item.name) || false}
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
                  <div key={i} className="items-right flex px-2">
                    {/* <option disabled={item.disabled} onClick={item.action}> */}
                    <a
                      onClick={item.disabled ? undefined : item.action}
                      className={`${item.disabled ? "disabled" : ""}`}
                    >
                      <div className="flex">
                        <Image src={Download} alt="Download" />
                        <label
                          className="cursor-pointer px-2"
                          htmlFor={`${item.label}`}
                        >
                          {item.label}
                        </label>
                      </div>
                    </a>
                    {/* </option> */}
                  </div>
                ))}
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>

      <div className=" mt-6 h-fit max-h-[65vh] overflow-x-scroll shadow-lg">
        {loading ? (
          <div className="flex h-full min-h-[50vh] items-center justify-center">
            <LoaderIcon className=" h-12 w-12" />
          </div>
        ) : (
          <div className=" max-h-fit max-w-fit">
            <table className="min-w-max border-separate border-spacing-0 ">
              <thead className=" sticky top-0 z-10 px-10 pb-10 text-[#646464]">
                <tr>
                  {TableRows.map((item, i) => {
                    if (visibleColumns.includes(item.name)) {
                      return (
                        <th
                          key={i}
                          className=" border-b-[1px] border-[#BABABA] bg-[#E8E9EB] py-3 pl-4 pr-8 text-start font-semibold"
                        >
                          {item.label}
                        </th>
                      );
                    } else {
                      return <Fragment key={i} />;
                    }
                  })}
                </tr>
              </thead>
              <tbody className="h-full bg-white">
                {reports.length ? (
                  reports.map((row, i) => (
                    <tr key={i} className=" border-b p-10">
                      {TableRows.map((key, idx) => {
                        if (visibleColumns.includes(key.name)) {
                          return (
                            <td
                              key={idx}
                              className="border-b-[1px] border-[#BABABA] py-2 pl-4 pr-10 text-start"
                            >
                              <div className={` ${key.className ?? ""}`}>
                                {renderKey(key, row)}
                              </div>
                            </td>
                          );
                        } else {
                          return <Fragment key={i} />;
                        }
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length}>
                      <span className="color-black flex justify-center py-4 text-center text-lg font-semibold">
                        No data found
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="my-4 ml-auto  flex w-fit justify-between">
        <Stack spacing={2}>
          <div className="flex items-center justify-between gap-4">
            <TablePagination
              component="div"
              count={totalPageCount}
              page={pagination.page}
              onPageChange={handleChangePagination}
              rowsPerPage={pagination.pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </Stack>
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
