import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import csv_download_icon from "../../assets/images/csv_download_icon.svg";
import Image, { type StaticImageData } from "next/image";
import { ApiHandler } from "~/service/UtilService";
import { getCSVTransactions } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { formatDate, tableFormatDate } from "~/helpers/helper";
import LoaderIcon from "../LoaderIcon";

type StatusKind = "IN_PROGRESS" | "COMPLETED" | "FAILED";

function PaymentHistory() {
  const [openRows, setOpenRows] = useState<number | null>(null);

  const toggleDropdown = (index: number) => {
    setOpenRows((prevOpenRow) => (prevOpenRow === index ? null : index));
  };

  const downloadCSV = (csvData: any, fileName: any) => {
    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row: any) =>
      Object.values(row)
        .map((val: any) => `"${val}"`)
        .join(","),
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = (file: any) => {
    const rows = file.rows.map(({ Asset, createdAt, ...rest }: any) => ({
      ...rest,
      "Created At": tableFormatDate(createdAt),
    }));
    downloadCSV(rows, file.fileName);
  };

  const getKind = (csvFile: any): StatusKind => {
    if (csvFile?.submitted > 0 || csvFile?.pending > 0) return "IN_PROGRESS";
    if (csvFile?.failed > 0) return "FAILED";
    return "COMPLETED";
  };

  const statusPill = (kind: StatusKind) => {
    if (kind === "COMPLETED") {
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    }
    if (kind === "FAILED") {
      return "bg-red-50 text-red-600 border border-red-200";
    }
    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  };

  const statusLabel = (kind: StatusKind) =>
    kind === "COMPLETED"
      ? "Completed"
      : kind === "FAILED"
        ? "Failed"
        : "In Progress";

  const progressBarColor = (kind: StatusKind) =>
    kind === "COMPLETED"
      ? "bg-emerald-500"
      : kind === "FAILED"
        ? "bg-red-500"
        : "bg-yellow-500";

  const rowStatusPill = (status: string) => {
    if (status === "COMPLETED")
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    if (status === "FAILED")
      return "bg-red-50 text-red-600 border border-red-200";
    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  };

  const rowStatusLabel = (status: string) => {
    if (status === "COMPLETED") return "Completed";
    if (status === "FAILED") return "Failed";
    return "In Progress";
  };

  const [isLoading, setLoading] = useState(false);
  const [CSVTrxs, setCSVTrxs] = useState<CSVTransactions[]>();

  const fetchCSV = async () => {
    setLoading(true);
    const [data]: APIResult<CSVTransactions[]> =
      await ApiHandler(getCSVTransactions);
    setLoading(false);

    if (data?.success) {
      setCSVTrxs(data.body);
    } else {
      toast.error("Failed to load CSV Transactions");
    }
  };

  useEffect(() => {
    void fetchCSV();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <LoaderIcon className=" h-12 w-12" />
      </div>
    );
  }

  const CsvFileIcon = () => (
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100">
      <span className="text-[10px] font-bold text-emerald-700">CSV</span>
    </div>
  );

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-lg font-bold text-black">Recent activity</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="py-3 font-medium">File Name</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Progress</th>
              <th className="py-3 font-medium">Uploaded Time</th>
              <th className="py-3 font-medium">Records</th>
              <th className="py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {CSVTrxs?.map((csvFile: any, index) => {
              const kind = getKind(csvFile);
              const done =
                kind === "COMPLETED"
                  ? csvFile?.completed
                  : kind === "FAILED"
                    ? csvFile?.failed
                    : (csvFile?.submitted ?? 0) + (csvFile?.pending ?? 0);
              const total = csvFile?.total ?? 0;
              const percent = total ? Math.round((done / total) * 100) : 0;
              const isOpen = openRows === index;

              return (
                <React.Fragment key={index}>
                  <tr className="border-b border-slate-100 align-middle">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <CsvFileIcon />
                        <div>
                          <p className="font-semibold text-black break-all">
                            {csvFile?.fileName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {csvFile?.fileSize ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${statusPill(kind)}`}
                      >
                        {statusLabel(kind)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="w-48">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full ${progressBarColor(kind)}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {done}/{total} records
                          </span>
                          <span>{percent}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="#64748B" strokeWidth="2" />
                          <path d="M3 9h18M8 3v4M16 3v4" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {formatDate(csvFile?.dateTime)}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-700">{total}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadCSV(csvFile)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          aria-label="Download"
                        >
                          <Image
                            src={csv_download_icon as StaticImageData}
                            alt="download"
                            className="h-4 w-4"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleDropdown(index)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          aria-label="Toggle"
                        >
                          {isOpen ? (
                            <FiChevronUp className="h-4 w-4" />
                          ) : (
                            <FiChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50/40 p-0">
                        <div className="px-4 py-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 text-left text-slate-500">
                                <th className="py-2 font-medium">S.NO</th>
                                <th className="py-2 font-medium">Asset</th>
                                <th className="py-2 font-medium">Address</th>
                                <th className="py-2 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {csvFile?.rows?.map((row: any, rowIndex: number) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-slate-100"
                                >
                                  <td className="py-3 text-slate-700">
                                    {String(rowIndex + 1).padStart(2, "0")}
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <Image
                                        src={row?.Asset?.icon}
                                        width={20}
                                        height={20}
                                        alt={row.assetId}
                                        className="h-5 w-5"
                                      />
                                      <span>{row.assetId}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 break-all text-slate-700">
                                    {row.toAddress}
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${rowStatusPill(row.status)}`}
                                    >
                                      {rowStatusLabel(row.status)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentHistory;
