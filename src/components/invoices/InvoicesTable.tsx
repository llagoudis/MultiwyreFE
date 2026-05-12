import React, { useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import ReactDOM from "react-dom/client";
import { Box, Button } from "@mui/material";
import CopyButton from "../../assets/general/copy.svg";
import {
  GridActionsCellItem,
  type GridColDef,
  type GridFilterModel,
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { fetchAddressDetails, getInvoices } from "~/service/ApiRequests";
import {
  convertImageToBase64,
  Debounce,
  ExportCsv,
  formatDate,
  onCopy,
} from "~/helpers/helper";

import Image from "next/image";
import Link from "next/link";
import MuiDataGrid from "../MuiDataGrid";
import InvoiceTemplate from "./InvoiceTemplate";
import InvoiceTemplateSafari from "./InvoiceTemplateSafari";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

export interface currencyType {
  id: number;
  name: string;
}

type TableRow = { row: Invoices };

type InvoicesTableProps = {
  invoiceUpdated: boolean;
};

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoiceUpdated }) => {
  const [transactions, setTransactions] = useState<Invoices[]>([]);

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  // console.log("transactions:-", transactions);

  const [showPending, setShowPending] = useState(false);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const intialSort = { field: "createdAt", sort: "DESC" };

  const [sort, setSort] = useState(intialSort);
  const [singleData, setSingleData] = useState<Invoices | null>(null);

  // Move these states and only populate them when download is clicked
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [invoiceImageUrl, setInvoiceImageUrl] = useState<any>(null);

  // console.log("addressDetails", addressDetails);
  const onFilterChange = Debounce((newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  }, 500);

  const [tableLoading, setTableLoading] = useState(false);
  const getTransactions = async (data: FilterType) => {
    setTableLoading(true);

    const [res, error]: APIResult<{
      data: Invoices[];
      pagination: Pagination;
    }> = await ApiHandler(getInvoices, data);
    setTableLoading(false);

    if (error) {
      handleClear();
      toast.error("Failed to load transactions");
    }
    if (res?.success && res.body?.data) {
      setTransactions(res.body?.data);
      setPageCount(res?.body?.pagination?.totalItems);
    }
  };

  const isFilterModelHasValue = filterModel?.items?.find((item) => item.value);

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
    };
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    void getTransactions(paramsQuery);
  }, [pagination, invoiceUpdated, sort, isFilterModelHasValue, showPending]);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const [isInvoiceReady, setIsInvoiceReady] = useState(false);

  useEffect(() => {
    // Only run PDF generation for non-Safari browsers
    if (
      isInvoiceReady &&
      singleData &&
      invoiceRef.current &&
      addressDetails &&
      bankDetails &&
      invoiceImageUrl
    ) {
      const generatePDF = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const input = invoiceRef.current;
          if (!input) {
            throw new Error("Invoice template not found");
          }

          // Wait for images to load
          const images = input.querySelectorAll("img");
          await Promise.all(
            Array.from(images).map((img) => {
              return new Promise((resolve) => {
                if (img.complete && img.naturalHeight !== 0) {
                  resolve(true);
                } else {
                  const handleLoad = () => {
                    img.removeEventListener("load", handleLoad);
                    img.removeEventListener("error", handleError);
                    resolve(true);
                  };
                  const handleError = () => {
                    img.removeEventListener("load", handleLoad);
                    img.removeEventListener("error", handleError);
                    console.warn("Image failed to load:", img.src);
                    resolve(true);
                  };

                  img.addEventListener("load", handleLoad);
                  img.addEventListener("error", handleError);

                  setTimeout(() => {
                    img.removeEventListener("load", handleLoad);
                    img.removeEventListener("error", handleError);
                    console.warn("Image loading timeout:", img.src);
                    resolve(true);
                  }, 5000);
                }
              });
            }),
          );

          // Generate canvas
          const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
            width: input.scrollWidth,
            height: input.scrollHeight,
            foreignObjectRendering: true,
            imageTimeout: 10000,
          });

          const imgData = canvas.toDataURL("image/png", 0.95);

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

          // Handle clickable areas if needed
          if (singleData?.invoiceURL) {
            const inputRect = input.getBoundingClientRect();
            const scale = pdfWidth / input.scrollWidth;

            // Find and add clickable elements
            const qrCodeContainer = input.querySelector(".qr-code-container");
            if (qrCodeContainer) {
              const rect = qrCodeContainer.getBoundingClientRect();
              try {
                pdf.link(
                  (rect.left - inputRect.left) * scale,
                  (rect.top - inputRect.top) * scale,
                  rect.width * scale,
                  rect.height * scale,
                  { url: singleData.invoiceURL },
                );
              } catch (linkError) {
                console.warn("Failed to add QR code link:", linkError);
              }
            }

            const payButtonContainer = input.querySelector(
              ".payment-button-container",
            );
            if (payButtonContainer) {
              const rect = payButtonContainer.getBoundingClientRect();
              try {
                pdf.link(
                  (rect.left - inputRect.left) * scale,
                  (rect.top - inputRect.top) * scale,
                  rect.width * scale,
                  rect.height * scale,
                  { url: singleData.invoiceURL },
                );
              } catch (linkError) {
                console.warn("Failed to add button link:", linkError);
              }
            }
          }

          // Manual download with better compatibility
          const blob = pdf.output("blob");
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `invoice-${singleData.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);

          toast.success("Invoice downloaded successfully");
        } catch (error) {
          console.error("Error generating PDF:", error);
          // toast.error(`Failed to generate PDF: ${error.message}`);
        } finally {
          // Reset all states
          setSingleData(null);
          setIsInvoiceReady(false);
          setAddressDetails(null);
          setBankDetails(null);
          setInvoiceImageUrl(null);
        }
      };
      generatePDF();
    }
  }, [
    isInvoiceReady,
    singleData,
    addressDetails,
    bankDetails,
    invoiceImageUrl,
  ]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 50, hideable: false },

    {
      minWidth: 140,
      field: "createdAt",
      headerName: "DATE",
      type: "date",
      filterable: true,
      valueGetter: (params: { row: any }) => new Date(params?.row?.createdAt),
      renderCell: ({ row }: TableRow) => formatDate(row?.createdAt) ?? "-",
    },

    {
      minWidth: 100,
      field: "name",
      headerName: "NAME",
    },

    {
      minWidth: 150,
      field: "recoveryEmail",
      headerName: "EMAIL",
      valueGetter: (params: { row: any }) =>
        new Date(params?.row?.EcomTransaction?.recoveryEmail),
      renderCell: ({ row }: any) => row?.EcomTransaction?.recoveryEmail ?? "-",
    },

    {
      minWidth: 200,
      field: "billingItems",
      headerName: "DESCRIPTION",
      renderCell: ({ row }: TableRow) => {
        if (
          !row?.EcomTransaction?.billingItems ||
          row?.EcomTransaction?.billingItems.length === 0
        )
          return "-";

        return (
          <div className=" flex h-full flex-col justify-end pb-0.5  text-xs leading-none">
            {row?.EcomTransaction?.billingItems.map((item, index) => (
              <p key={index} className="h-fit">
                {item.description ? (
                  <>
                    {item.description}{" "}
                    <span className=" text-[10px] font-semibold">
                      ({row?.currency}
                    </span>{" "}
                    <span className=" text-[12px] font-bold">
                      {item.amount})
                    </span>
                  </>
                ) : (
                  item.amount
                )}
              </p>
            ))}
          </div>
        );
      },
    },
    {
      minWidth: 100,
      field: "fiatAmount",
      headerName: "REQUESTED",
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.amount ?? ""} ${" "} ${
          row?.amount ? `(${row?.currency})` : "-"
        } `}</p>
      ),
    },

    {
      flex: 1,
      minWidth: 125,
      field: "exactAmount",
      headerName: "INVOICED",
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.EcomTransaction?.exactAmount ?? ""} ${" "} ${
          row?.EcomTransaction?.exactAmount
            ? `(${row?.EcomTransaction?.assetId})`
            : "-"
        } `}</p>
      ),
    },

    {
      flex: 1,
      minWidth: 125,
      field: "paidAmount",
      headerName: "PAID",
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.EcomTransaction?.amount ?? ""} ${" "} ${
          row?.EcomTransaction?.amount
            ? `(${row?.EcomTransaction?.assetId})`
            : "-"
        } `}</p>
      ),
    },

    {
      minWidth: 100,
      field: "status",
      type: "singleSelect",
      valueOptions: ["PENDING", "QUEUED", "COMPLETED", "FAILED"],
      headerName: "STATUS",
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.EcomTransaction?.status}`}</p>
      ),
    },

    {
      minWidth: 130,
      field: "invoiceURL",
      headerName: "INVOICE URL",
      renderCell: ({ row }: TableRow) => {
        return (
          <p>
            {row.invoiceURL ? (
              <span className=" flex gap-4">
                <Link
                  href={row.invoiceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" whitespace-nowrap font-normal text-blue-500 underline"
                >
                  Link URL
                </Link>

                <span
                  className=" flex w-full justify-center"
                  onClick={() => onCopy(row?.invoiceURL)}
                >
                  <Image
                    className=" cursor-pointer"
                    src={CopyButton}
                    alt="copy"
                  />
                </span>
              </span>
            ) : (
              "-"
            )}
          </p>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "ACTION",
      width: 80,
      getActions: ({ row }: TableRow) => [
        <GridActionsCellItem
          key="view"
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "7rem",
            fontSize: "14px",
          }}
          label="Download invoice"
          onClick={async () => {
            const [res, error]: APIResult<{
              invoiceImg: OnvoiceDetailsProp;
              bankDetails: bankDetailsProp;
              fromAddress: addressDetailsProp;
            }> = await ApiHandler(() => fetchAddressDetails(row?.projectId));

            const userAgent = window.navigator.userAgent;
            const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

            const base64 = await convertImageToBase64(
              res?.body?.invoiceImg?.invoiceImgLink,
            );

            const qrBase64 = await QRCode.toDataURL(row.invoiceURL || "", {
              width: 120,
            });

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
                  <InvoiceTemplate
                    invoice={row}
                    addressDetails={res?.body?.fromAddress}
                    bankDetails={res?.body?.bankDetails}
                    invoiceImageUrl={res?.body?.invoiceImg}
                    base64={base64}
                    qrImage={qrBase64}
                  />,
                );
                setTimeout(resolve, 500); // Wait for render
              });

              const canvas = await html2canvas(container, {
                scale: 2,
              });
              const imgData = canvas.toDataURL("image/jpeg", 1.0);

              const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
              });

              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

              pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

              // 🔹 Find the link element in the off-screen render
              const linkElement =
                container.querySelector<HTMLAnchorElement>(".pdf-link");

              if (linkElement) {
                const rect = linkElement.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // px → mm conversion
                const pxToMm = (px: number) => px * 0.264583;

                const x = pxToMm(rect.left - containerRect.left);
                const y = pxToMm(rect.top - containerRect.top);
                const width = pxToMm(rect.width);
                const height = pxToMm(rect.height);

                pdf.link(x, y, width, height, { url: linkElement.href });
              }

              //  Manual download (better Safari compatibility)
              const blob = pdf.output("blob");
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download = `Invoice_${row?.id}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(blobUrl);

              // Cleanup
              root.unmount();
              document.body.removeChild(container);
            } else {
              // Safari
              const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
                <InvoiceTemplateSafari
                  invoice={row}
                  addressDetails={res?.body?.fromAddress}
                  bankDetails={res?.body?.bankDetails}
                  invoiceImageUrl={res?.body?.invoiceImg}
                  base64={base64}
                  qrImage={qrBase64} // new prop
                />,
              );

              // Create a new window
              const win = window.open("", "_blank");
              if (win) {
                // Get all current CSS links from the main document
                const styles = Array.from(
                  document.querySelectorAll('link[rel="stylesheet"], style'),
                )
                  .map((node) => node.outerHTML)
                  .join("\n");

                // Write HTML content to the new window
                win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice_${row?.id}</title>
          ${styles} <!-- Inject Tailwind + other CSS -->
      </head>
      <body>
        ${htmlTemplate}
      </body>
      </html>
    `);

                win.print();
              } else {
                console.error("Unable to open new window");
              }
            }
          }}
          showInMenu
        />,
      ],
    },
  ];

  function handleClear() {
    setFilterModel({ items: [] });
    setShowPending(false);
    setSort(intialSort);
  }

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    const [res, error]: APIResult<{
      data: Invoices[];
      pagination: Pagination;
    }> = await ApiHandler(getInvoices, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      const { id } = row;

      const DATE = `${formatDate(row?.createdAt)}`;

      reportHeaderval.push({
        ID: id,
        DATE: DATE,
        NAME: row?.name,
        EMAIL: row?.email,
        DESCRIPTION: row?.description,
        REQUESTED: `${row?.amount ?? ""} ${" "} ${
          row?.amount ? `(${row?.currency})` : "-"
        } `,
        INVOICED: `${row?.EcomTransaction?.exactAmount ?? ""} ${" "} ${
          row?.EcomTransaction?.exactAmount
            ? `(${row?.EcomTransaction?.assetId})`
            : "-"
        } `,
        PAID: `${row?.EcomTransaction?.amount ?? ""} ${" "} ${
          row?.EcomTransaction?.amount
            ? `(${row?.EcomTransaction?.assetId})`
            : "-"
        }`,
        STATUS: row?.EcomTransaction?.status,
        "INVOICE URL": row?.invoiceURL,
      });
    });

    void ExportCsv(reportHeaderval, "Invoices");
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button size="small" onClick={handleExport}>
          Export
        </Button>
        <Button size="small" onClick={handleClear}>
          Clear
        </Button>
      </GridToolbarContainer>
    );
  }

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};
    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort(intialSort);
    }
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={transactions}
            columns={columns}
            loading={tableLoading}
            rowCount={pageCount}
            slots={{
              toolbar: CustomToolbar,
            }}
            filterMode="server"
            sortingMode="server"
            paginationMode="server"
            onFilterModelChange={onFilterChange}
            onSortModelChange={onSortChange}
            filterModel={filterModel}
            pageSizeOptions={[10]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
          />
        </Box>
      </div>
    </div>
  );
};

export default InvoicesTable;
