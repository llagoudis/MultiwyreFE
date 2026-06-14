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
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { MdOutlineFileDownload } from "react-icons/md";
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

function CustomToolbar({ handleExport, handleClear }: any) {
  return (
    <GridToolbarContainer className="flex items-center justify-between  bg-white mb-4">
      <Box sx={{
        display: "flex",
        gap: 1,
        "& .MuiButton-root": {
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          color: "white",
          border: "1px solid #E2E8F0",
          px: 2,
          py: 1,
          fontSize: "13px",
          fontWeight: "500",
          textTransform: "none",
          minWidth: "auto",
          "& svg": {
            color: "white",
          },
          "&:hover": {
            backgroundColor: "#F8F9FA",
            borderColor: "#CBD5E1",
          },
          "& .MuiButton-startIcon": {
          }
        }
      }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </Box>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="rounded-md border border-[#E2E8F0] bg-white text-white px-4 py-3 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        <button
          onClick={handleClear}
          className="rounded-md border border-[#E2E8F0] bg-white text-white px-4 py-3 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Clear
        </button>
      </div>
    </GridToolbarContainer >
  );
}

function CustomPagination({ pageCount, pagination, setPagination }: any) {
  const totalPages = Math.ceil(pageCount / (pagination.pageSize || 10));
  const currentPage = (pagination.page || 0) + 1;

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page: page - 1 });
  };

  const renderPageButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentPage === i
            ? "bg-gradient-to-br from-[#4775F2] to-[#B647F2] text-white shadow-md border-none"
            : "text-white hover:bg-gray-50 border border-[#E2E8F0]"
            }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots" className="text-white px-1">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentPage === totalPages
            ? "bg-gradient-to-br from-[#4775F2] to-[#B647F2] text-white shadow-md border-none"
            : "text-white hover:bg-gray-50 border border-[#E2E8F0]"
            }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex items-center justify-center gap-2 p-6 bg-white border-t border-gray-100">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg text-white disabled:opacity-30 hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg text-white disabled:opacity-30 hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5 px-1">
          {renderPageButtons()}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg text-white disabled:opacity-30 hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center border border-[#E2E8F0] rounded-lg text-white disabled:opacity-30 hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Invoices | null>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = React.useCallback((event: React.MouseEvent<HTMLElement>, row: Invoices) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  }, []);

  const handleMenuClose = React.useCallback(() => {
    setAnchorEl(null);
    setSelectedRow(null);
  }, []);

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

  const handleDownload = async (row: Invoices) => {
    handleMenuClose();
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
      container.style.top = "-9999px";
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
        setTimeout(resolve, 500);
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

      const linkElement = container.querySelector<HTMLAnchorElement>(".pdf-link");

      if (linkElement) {
        const rect = linkElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const pxToMm = (px: number) => px * 0.264583;

        const x = pxToMm(rect.left - containerRect.left);
        const y = pxToMm(rect.top - containerRect.top);
        const width = pxToMm(rect.width);
        const height = pxToMm(rect.height);

        pdf.link(x, y, width, height, { url: linkElement.href });
      }

      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice_${row?.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      root.unmount();
      document.body.removeChild(container);
    } else {
      const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
        <InvoiceTemplateSafari
          invoice={row}
          addressDetails={res?.body?.fromAddress}
          bankDetails={res?.body?.bankDetails}
          invoiceImageUrl={res?.body?.invoiceImg}
          base64={base64}
          qrImage={qrBase64}
        />,
      );

      const win = window.open("", "_blank");
      if (win) {
        const styles = Array.from(
          document.querySelectorAll('link[rel="stylesheet"], style'),
        )
          .map((node) => node.outerHTML)
          .join("\n");

        win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice_${row?.id}</title>
          ${styles}
      </head>
      <body>
        ${htmlTemplate}
      </body>
      </html>
    `);

        win.print();
      }
    }
  };

  const columns = React.useMemo<GridColDef[]>(() => [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: ({ row }: TableRow) => (
        <span className="font-medium text-[#1A1C1E]">{row.id}</span>
      )
    },
    {
      minWidth: 140,
      field: "createdAt",
      headerName: "Date",
      valueGetter: (params: { row: any }) => new Date(params?.row?.createdAt),
      renderCell: ({ row }: TableRow) => (
        <div className="flex flex-col text-xs font-medium text-white leading-tight">
          <span>{formatDate(row?.createdAt)?.split(' ')[0]}</span>
          <span className="text-[10px] opacity-70 uppercase">
            {formatDate(row?.createdAt)?.split(' ')[1]} {formatDate(row?.createdAt)?.split(' ')[2]}
          </span>
        </div>
      ),
    },
    {
      minWidth: 150,
      field: "name",
      headerName: "Name",
      renderCell: ({ row }: TableRow) => (
        <span className=" text-[#1A1C1E]">{row.name || "-"}</span>
      )
    },
    {
      minWidth: 180,
      field: "customerEmail",
      headerName: "Email",
      renderCell: ({ row }: any) => (
        <span className="text-white font-medium">{row?.EcomTransaction?.customerEmail || "-"}</span>
      ),
    },
    {
      minWidth: 250,
      field: "billingItems",
      headerName: "Description",
      renderCell: ({ row }: TableRow) => {
        const items = row?.EcomTransaction?.billingItems;
        if (!items || items.length === 0) return "-";

        return (
          <div className="flex flex-col py-1 text-xs text-white font-medium truncate">
            {items.map((item, index) => (
              <p key={index} className="truncate">
                {item.description} ({row?.currency} {item.amount})
              </p>
            ))}
          </div>
        );
      },
    },
    {
      minWidth: 140,
      field: "amount",
      headerName: "Requested",
      renderCell: ({ row }: TableRow) => (
        <div className="font-medium text-[#1A1C1E] text-xs">
          {row?.amount} <span className="text-[10px] text-white">({row?.currency})</span>
        </div>
      ),
    },
    {
      minWidth: 150,
      field: "exactAmount",
      headerName: "Invoiced",
      renderCell: ({ row }: TableRow) => (
        <div className="flex flex-col text-xs font-medium text-[#1A1C1E] leading-tight">
          <span>{row?.EcomTransaction?.exactAmount || "-"}</span>
          {row?.EcomTransaction?.exactAmount && (
            <span className="text-[10px] text-white">({row?.EcomTransaction?.assetId})</span>
          )}
        </div>
      ),
    },
    {
      minWidth: 150,
      field: "paidAmount",
      headerName: "Paid",
      renderCell: ({ row }: TableRow) => (
        <div className="flex flex-col text-xs font-medium text-[#1A1C1E] leading-tight">
          <span>{row?.EcomTransaction?.amount || "-"}</span>
          {row?.EcomTransaction?.amount && (
            <span className="text-[10px] text-white">({row?.EcomTransaction?.assetId})</span>
          )}
        </div>
      ),
    },
    {
      minWidth: 120,
      field: "status",
      headerName: "Status",
      renderCell: ({ row }: TableRow) => {
        const status = row?.EcomTransaction?.status?.toUpperCase();
        let bg = "bg-[#FFF8E6] text-[#FFA800] border-[#FFA80033]"; // PENDING
        if (status === "COMPLETED") bg = "bg-[#E6F9F1] text-[#00C076] border-[#00C07633]";
        if (status === "FAILED") bg = "bg-[#FFF2F2] text-[#FF3B3B] border-[#FF3B3B33]";

        return (
          <span className={`${bg} px-3 py-1.5 rounded-lg text-[11px] font-bold border`}>
            {status ? status.charAt(0) + status.slice(1).toLowerCase() : "Pending"}
          </span>
        );
      },
    },
    {
      minWidth: 150,
      field: "invoiceURL",
      headerName: "Invoice URL",
      renderCell: ({ row }: TableRow) => (
        <div className="flex items-center gap-2">
          {row.invoiceURL ? (
            <>
              <Link
                href={row.invoiceURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4775F2] text-xs  underline"
              >
                Link Url
              </Link>
              <button
                onClick={() => onCopy(row?.invoiceURL)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </>
          ) : "-"}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      width: 80,
      sortable: false,
      renderCell: ({ row }: TableRow) => (
        <div
          onClick={(e) => handleMenuClick(e, row)}
          className="w-10 h-10 flex items-center justify-center border border-[#E2E8F0] rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="2" fill="#D1D5DB" />
            <circle cx="2" cy="8" r="2" fill="#D1D5DB" />
            <circle cx="2" cy="14" r="2" fill="#D1D5DB" />
          </svg>
        </div>
      ),
    },
  ], [handleMenuClick]);

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

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row.id,
        DATE: formatDate(row?.createdAt),
        NAME: row?.name,
        EMAIL: row?.EcomTransaction?.customerEmail,
        DESCRIPTION: row?.description,
        REQUESTED: `${row?.amount ?? ""} (${row?.currency})`,
        INVOICED: `${row?.EcomTransaction?.exactAmount ?? ""} (${row?.EcomTransaction?.assetId})`,
        PAID: `${row?.EcomTransaction?.amount ?? ""} (${row?.EcomTransaction?.assetId})`,
        STATUS: row?.EcomTransaction?.status,
        "INVOICE URL": row?.invoiceURL,
      });
    });

    void ExportCsv(reportHeaderval, "Invoices");
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
      <div className="tableComponent">
        <Box sx={{
          width: "100%",
          "& .MuiDataGrid-root": {
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#F8F9FA",
              borderRadius: "0px",
              borderBottom: "1px solid #E2E8F0",
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#F8F9FA",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                color: "#1A1C1E",
                fontWeight: "600",
                fontSize: "13px",
                textTransform: "none",
              },
              "& .MuiDataGrid-iconButtonContainer": {
                visibility: "visible !important",
              },
              "& .MuiDataGrid-sortIcon": {
                opacity: "1 !important",
              },
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #F1F5F9",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#F8FAFC",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
            }
          }
        }}>
          <MuiDataGrid
            rows={transactions}
            columns={columns}
            loading={tableLoading}
            rowCount={pageCount}
            slots={{
              toolbar: CustomToolbar,
              pagination: CustomPagination,
              columnUnsortedIcon: () => (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 1, color: "#4775F2" }}>
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
              ),
              columnSortedAscendingIcon: () => (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#4775F2" }}>
                  <path d="M17 15l-5-5-5 5" />
                </svg>
              ),
              columnSortedDescendingIcon: () => (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#4775F2" }}>
                  <path d="M7 9l5 5 5-5" />
                </svg>
              ),
            }}
            slotProps={{
              toolbar: { handleExport, handleClear } as any,
              pagination: { pageCount, pagination, setPagination } as any
            }}
            getRowHeight={() => "auto"}
            sx={{
              "& .MuiDataGrid-columnHeaderTitleContainer": {
                display: "flex",
                gap: "4px",
                overflow: "visible !important",
                minWidth: 0,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                overflow: "visible !important",
                textOverflow: "inherit !important",
                whiteSpace: "nowrap",
                fontWeight: "600",
              },
              "& .MuiDataGrid-iconButtonContainer": {
                visibility: "visible !important",
                width: "auto !important",
              },
              "& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-iconButtonContainer": {
                visibility: "visible !important",
              },
              "& .MuiDataGrid-sortIcon": {
                opacity: "1 !important",
                display: "block !important",
              },
              "& .MuiDataGrid-menuIcon": {
                visibility: "visible !important",
                width: "auto !important",
                "& .MuiButtonBase-root": {
                  color: "#D1D5DB !important",
                }
              },
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

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: '12px',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => selectedRow && handleDownload(selectedRow)}
          sx={{ py: 1.5, px: 2, gap: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 'auto !important' }}>
            <MdOutlineFileDownload className="text-xl text-[#4775F2]" />
          </ListItemIcon>
          <ListItemText
            primary="Download"
            primaryTypographyProps={{ fontSize: '13px', fontWeight: 600, color: '#1A1C1E' }}
          />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default InvoicesTable;
