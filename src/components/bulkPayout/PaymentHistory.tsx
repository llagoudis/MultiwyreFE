import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import csv_file_icon from "../../assets/images/csv_file_icon.svg";
import Inprogress from "../../assets/images/Inprogress.svg";
import csv_download_icon from "../../assets/images/csv_download_icon.svg";
import Image, { type StaticImageData } from "next/image";
import { ApiHandler } from "~/service/UtilService";
import { getCSVTransactions } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { formatDate, tableFormatDate } from "~/helpers/helper";
import LoaderIcon from "../LoaderIcon";

function PaymentHistory() {
  const [openRows, setOpenRows] = useState<number | null>(null);

  const toggleDropdown = (index: number) => {
    setOpenRows((prevOpenRow) => (prevOpenRow === index ? null : index));
  };

  // Helper function to convert data to CSV and trigger download
  const downloadCSV = (csvData: any, fileName: any) => {
    // Extract column headers from the first row
    const headers = Object.keys(csvData[0]).join(",");

    const rows = csvData.map((row: any) =>
      Object.values(row)
        .map((val: any) => `"${val}"`) // Escape each value to handle commas and newlines
        .join(","),
    );

    const csvContent = [headers, ...rows].join("\n");

    // Create a blob for the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a link element to download the file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Programmatically click the link to trigger the download
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

  const statusColor = (status: string) => {
    let className = "";
    if (status === "SUBMITTED" || status === "PENDING") {
      return (className = "text-[#C1922E]");
    } else if (status === "FAILED") {
      return (className = "text-[#FF3700]");
    } else if (status === "COMPLETED") {
      return (className = "text-[#0D9B27]");
    }

    return className;
  };

  const [isLoading, setLoading] = useState(false);
  const [CSVTrxs, setCSVTrxs] = useState<CSVTransactions[]>();

  const fetchCSV = async () => {
    setLoading(true);
    const [data]: APIResult<CSVTransactions[]> =
      await ApiHandler(getCSVTransactions);
    setLoading(false);

    if (data?.success) {
      //
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

  return (
    <div className="w-full">
      <div className="ml-auto w-full rounded-lg bg-white p-4 shadow-md">
        <p className="text-md m-6 font-semibold">RECENT ACTIVITY </p>
        <div className="mb-5 grid grid-cols-4 rounded-md bg-gray-100 p-4 text-gray-600">
          <div className="text-center">FILE NAME</div>
          <div className="text-center">STATUS</div>
          <div className="text-center">UPLOAD TIME</div>
          <div className="text-center">ACTION</div>
        </div>
        {CSVTrxs?.map((csvFile, index) => (
          <div key={index} className="mb-4 pb-2">
            <div className="grid grid-cols-4  font-semibold">
              <div className="flex gap-3 pl-20 text-center">
                <Image
                  src={csv_file_icon as StaticImageData}
                  alt="download"
                  className="h-10 w-10"
                />
                <p className="break-all">{csvFile?.fileName}</p>
              </div>
              <div className={` text-center  ${statusColor(csvFile?.status)}`}>
                {csvFile?.submitted > 0 || csvFile?.pending > 0 ? (
                  <div className="flex items-center gap-2 ">
                    <Image
                      src={Inprogress as StaticImageData}
                      alt="Inprogress"
                      className="h-5 w-5 rotate-180"
                      style={{ animation: "spin 2s linear infinite reverse" }}
                    />
                    <p className={`${statusColor("SUBMITTED")}`}>
                      {"Inprogress"} - {csvFile?.submitted + csvFile?.pending}
                      {"/"}
                      <span className="">{csvFile?.total}</span>
                    </p>
                  </div>
                ) : csvFile?.failed > 0 ? (
                  <p>
                    {"Failed"} - {csvFile?.failed}/
                    <span className={`${statusColor("FAILED")}`}>
                      {csvFile?.total}
                    </span>
                  </p>
                ) : csvFile?.completed > 0 ? (
                  <p>
                    {"Completed"} - {csvFile?.completed}/
                    <span className={`${statusColor("COMPLTED")}`}>
                      {csvFile?.total}
                    </span>
                  </p>
                ) : null}
              </div>
              <div className="items-center  text-center ">
                {formatDate(csvFile?.dateTime)}
              </div>
              <div className=" flex  justify-center  gap-2 text-center">
                <Image
                  onClick={() => handleDownloadCSV(csvFile)}
                  src={csv_download_icon as StaticImageData}
                  alt="download"
                  className="h-10 w-10 cursor-pointer"
                />
                <button
                  onClick={() => toggleDropdown(index)}
                  className="text-gray-600"
                >
                  {openRows === index ? (
                    <FiChevronUp className="h-5 w-5" />
                  ) : (
                    <FiChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* Dropdown content */}
            <div
              className={`${
                openRows === index ? "max-h-96" : "max-h-0"
              } overflow-auto transition-all duration-700`}
            >
              {openRows === index && (
                <div className="mt-4">
                  {/* Headers for the dropdown */}
                  <div className="mb-2 grid grid-cols-4 rounded-full bg-gray-100 p-4 text-gray-600">
                    <div className="text-center">SL NO</div>
                    <div className="text-center">ASSET</div>
                    <div className="text-center">ADDRESS</div>
                    <div className="text-center">STATUS</div>
                  </div>
                  {/* Rows */}
                  {csvFile?.rows?.map((row, rowIndex) => (
                    <div
                      key={row.id}
                      className="mb-2 grid grid-cols-4 break-all p-4"
                    >
                      <div className="text-center">{rowIndex + 1}</div>
                      <div className="flex items-center justify-center gap-4 break-all  text-center">
                        <Image
                          // onClick={() => handleDownloadCSV(csvFile)}
                          src={row?.Asset?.icon}
                          width={10}
                          height={10}
                          alt="download"
                          className="h-5 w-5 cursor-pointer"
                        />

                        <p> {row.assetId}</p>
                      </div>
                      <div className="break-all text-start">
                        {row.toAddress}
                      </div>
                      <div
                        className={`break-all text-center ${statusColor(
                          row.status,
                        )}`}
                      >
                        {row.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentHistory;
