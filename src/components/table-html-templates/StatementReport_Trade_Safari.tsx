/* eslint-disable @next/next/no-img-element */
import Image, { type StaticImageData } from "next/image";
import React from "react";
import useDashboard from "~/hooks/useDashboard";

interface StatementReportProps {
  rows: any[];
  currency: string;
  startDate: string;
  endDate: string;
  companyLegalName: string;
  adminImage: any;
  address: string;
}
[];

const StatementReport_Trade_Safari: React.FC<StatementReportProps> = ({
  rows,
  currency,
  startDate,
  endDate,
  companyLegalName,
  adminImage,
  address,
}) => {
  const { firstname, lastname } = useDashboard();

  const startD = new Date(startDate);
  const startDay = startD.getDate().toString().padStart(2, "0"); // Ensure 2-digit format
  const startMonth = (startD.getMonth() + 1).toString().padStart(2, "0"); // Add 1 since months are zero-based
  const startYear = startD.getFullYear();
  const formattedStartDate = `${startDay}.${startMonth}.${startYear}`;

  const endD = new Date(endDate);
  const endDay = endD.getDate().toString().padStart(2, "0"); // Ensure 2-digit format
  const endMonth = (endD.getMonth() + 1).toString().padStart(2, "0"); // Add 1 since months are zero-based
  const endYear = endD.getFullYear();
  const formattedEndDate = `${endDay}.${endMonth}.${endYear}`;

  const formatDate = (date: string | undefined): string => {
    if (!date) return "";
    const tempDate = new Date(date);
    const dob = new Date(
      tempDate.getTime() + tempDate.getTimezoneOffset() * -1 * 60000,
    );
    const day = dob.getDate().toString().padStart(2, "0");
    const month = (dob.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so we add 1
    const year = dob.getFullYear();
    const hours = dob.getHours().toString().padStart(2, "0");
    const minutes = dob.getMinutes().toString().padStart(2, "0");
    const seconds = dob.getSeconds().toString().padStart(2, "0");
    const formattedDate = `${day}.${month}.${year}${String.fromCharCode(
      160,
    )}${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  return (
    <div
      style={{
        width: "90%",
        margin: "0 auto",
        pageBreakInside: "avoid",
      }}
    >
      <div
        style={{
          display: "flex",
          margin: " 1rem 0",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "end",
          pageBreakInside: "avoid",
        }}
      >
        <div
          style={{
            padding: "1rem 0",
            fontSize: "2.4rem",
            color: "#000000",
            fontWeight: "400",
            pageBreakInside: "avoid",
          }}
        >
          {companyLegalName ?? "---"}
        </div>

        {adminImage && (
          <div>
            <Image
              alt={"Profile"}
              className="h-[60px] w-[auto] object-cover"
              src={adminImage as StaticImageData}
              width={"150"}
              height={"100"}
            />
          </div>
        )}
      </div>

      <div
        style={{
          margin: "1rem 0",
          pageBreakInside: "avoid",
          pageBreakBefore: "avoid",
          pageBreakAfter: "avoid",
        }}
      >
        <p className="py-2 text-base font-semibold">Statement</p>
        <p className="text-xs">
          Name: {`${firstname ?? ""} ${lastname ?? ""}`}
        </p>
        <p className="text-xs">Address: {`${address ?? ""}`}</p>
        <p className="text-xs">
          Period: {`${formattedStartDate} - ${formattedEndDate}`}
        </p>
        <p className="text-xs">Currency: {`${currency ?? "-"}`}</p>
      </div>

      <table
        style={{
          width: "100%",
          border: "2px solid darkgray",
          padding: "0",
          margin: "0 0",
          borderCollapse: "collapse",
          backgroundColor: "white",
          fontSize: "10px",
          pageBreakInside: "auto",
          pageBreakBefore: "auto",
          pageBreakAfter: "auto",
          tableLayout: "fixed",
        }}
      >
        {/* titles */}

        <thead
          style={{
            backgroundColor: "black",
            color: "white",
            display: "table-header-group",
          }}
        >
          <tr
            style={{
              pageBreakInside: "avoid",
              pageBreakAfter: "auto",
            }}
          >
            <th
              style={{
                padding: "4px",
                borderRight: "1px solid white",
                width: "30px",
                verticalAlign: "center",
              }}
            >
              No.
            </th>
            <th
              style={{
                padding: "4px",
                borderRight: "1px solid white",
                minWidth: "120px",
                maxWidth: "120px",
                verticalAlign: "center",
              }}
            >
              Date (UTC)
            </th>
            <th
              style={{
                padding: "4px",
                borderRight: "1px solid white",
                minWidth: "120px",
                maxWidth: "120px",
                verticalAlign: "center",
              }}
            >
              Sender
            </th>
            <th
              style={{
                padding: "4px",
                borderRight: "1px solid white",
                minWidth: "120px",
                maxWidth: "120px",
                verticalAlign: "center",
              }}
            >
              Reciver
            </th>

            <th
              style={{
                padding: "4px",
                borderRight: "1px solid white",
                minWidth: "100px",
                maxWidth: "100px",
                verticalAlign: "center",
              }}
            >
              Transaction Id
            </th>
            <th
              style={{
                padding: "4px",
                minWidth: "100px",
                maxWidth: "100px",
                verticalAlign: "center",
              }}
            >
              Amount
            </th>
            <th
              style={{
                padding: "4px",
                minWidth: "100px",
                maxWidth: "100px",
                verticalAlign: "center",
              }}
            >
              Net Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {/* main table rows */}

          {rows.map((row, index) => (
            <tr
              key={row.transactionId}
              style={{
                pageBreakInside: "avoid",
                pageBreakAfter: "auto",
              }}
            >
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "center",
                  verticalAlign: "top",
                  minWidth: "30px",
                  maxWidth: "30px",
                }}
              >
                {index + 1}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "center",
                  verticalAlign: "top",
                  minWidth: "120px",
                  maxWidth: "120px",
                }}
              >
                {formatDate(row.createdAt)}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "left",
                  width: "120px",
                  maxWidth: "120px",
                  overflowWrap: "break-word",
                  verticalAlign: "top",
                }}
              >
                {row?.assetId} {row.sourceAddress ?? ""}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "left",
                  width: "120px",
                  maxWidth: "120px",
                  overflowWrap: "break-word",
                  verticalAlign: "top",
                }}
              >
                {row?.destinationAssetId} {row.destinationAddress ?? ""}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "left",
                  verticalAlign: "top",
                  overflowWrap: "break-word",
                }}
              >
                {row?.transactionId}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "left",
                  verticalAlign: "top",
                  overflowWrap: "break-word",
                }}
              >
                {row?.TransactionFee?.amount} {row?.assetId}
              </td>
              {/* net amount */}
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "left",
                  verticalAlign: "top",
                  overflowWrap: "break-word",
                }}
              >
                {row?.TransactionFee?.creditedAmount} {row?.destinationAssetId}
              </td>
            </tr>
          ))}

          {/* after table */}

          {/* turnovers */}
        </tbody>
      </table>
    </div>
  );
};

export default StatementReport_Trade_Safari;
