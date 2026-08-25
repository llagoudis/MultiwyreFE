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

const StatementReport: React.FC<StatementReportProps> = ({
  rows,
  currency,
  startDate,
  endDate,
  companyLegalName,
  adminImage,
  address,
}) => {
  const { firstname, lastname, assets } = useDashboard();
  const walletAddress =
    assets.filter((val) => val.name === currency)?.[0]?.assetAddress ??
    "The wallet is not specified";
  console.log("assets", assets);
  console.log("walletAddress", walletAddress);

  function getFlooredFixed(v: any, d: any) {
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }

  function getFixed(v: number, d: number) {
    return Number(v).toFixed(d);
  }

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

  let debitTurnover = 0;
  let creditTurnover = 0;
  let otherTurnover = 0;

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

  const countTurnovers = () => {
    rows.forEach((val) => {
      if (val.operationType === 1) {
        creditTurnover =
          creditTurnover + Number(val.TransactionFee?.amount ?? 0);
      } else if (val.operationType === 2) {
        debitTurnover = debitTurnover + Number(val.TransactionFee?.amount ?? 0);
      } else {
        otherTurnover = otherTurnover + Number(val.TransactionFee?.amount ?? 0);
      }
    });
  };

  const colorByOperationType = (type: number) => {
    switch (type) {
      case 1:
        return "green";
      case 2:
        return "red";
      case 3:
        return "darkgray";
      case 4:
        return "olivedrab";
      case 5:
        return "purple";
      case 6:
        return "olive";
      case 7:
        return "tomato";
      case 8:
        return "orange";
      default:
        return "black";
    }
  };

  const prefixByOperationType = (type: number) => {
    switch (type) {
      case 1:
        return "+";
      case 2:
        return "-";
      case 3:
        return "";
      case 4:
        return "";
      case 5:
        return "";
      case 6:
        return "";
      case 7:
        return "";
      case 8:
        return "";
      default:
        return "";
    }
  };

  countTurnovers();

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
        <p className="text-xs">Wallet address: {walletAddress}</p>
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
              TxHash
            </th>
            <th
              style={{
                padding: "4px",
                minWidth: "120px",
                borderRight: "1px solid white",
                verticalAlign: "center",
              }}
            >
              Description
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
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {/* before table */}
          <tr
            style={{
              pageBreakInside: "avoid",
              pageBreakAfter: "auto",
            }}
          >
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "center",
                verticalAlign: "top",
              }}
            ></td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
              colSpan={4}
            >{`${
              rows.length ? rows[0].assetId : "-"
            } Opening balance ${formattedStartDate}`}</td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
            >{`${
              rows.length
                ? getFixed(rows[0].TransactionFee?.balance ?? 0, 8)
                : "0"
            }`}</td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
            ></td>
          </tr>

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
                {row.sourceAddress ?? ""}
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
                {row?.txHash ?? ""}
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
                {row.operation === "EXCHANGE"
                  ? `Exchange - Order ${row?.TransactionFee?.type ?? ""} - ${
                      row?.TransactionFee?.clientRate ?? ""
                    } @ ${row?.orderType}`
                  : row?.note}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "right",
                  verticalAlign: "top",
                  color: `${colorByOperationType(row.operationType)}`,
                  minWidth: "100px",
                  maxWidth: "100px",
                }}
              >
                {`${prefixByOperationType(row.operationType)}${getFixed(
                  row.TransactionFee?.amount ?? 0,
                  8,
                )}`}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid darkgray",
                  textAlign: "right",
                  verticalAlign: "top",
                  minWidth: "100px",
                  maxWidth: "100px",
                }}
              >
                {getFixed(row.TransactionFee?.balance ?? 0, 8)}
              </td>
            </tr>
          ))}

          {/* after table */}

          <tr
            style={{
              pageBreakInside: "avoid",
              pageBreakAfter: "auto",
            }}
          >
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "center",
                verticalAlign: "top",
              }}
            ></td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
              colSpan={4}
            >{`${
              rows.length ? rows[0].assetId : "-"
            } Closing balance ${formattedEndDate}`}</td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
            >
              {`${
                rows.length
                  ? getFixed(
                      rows[rows.length - 1].TransactionFee?.balance ?? 0,
                      8,
                    )
                  : "0"
              }`}
            </td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                backgroundColor: "lightgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
            ></td>
          </tr>

          {/* turnovers */}

          <tr
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
              }}
            ></td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
              colSpan={4}
            >{`Debit turnover`}</td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                textAlign: "right",
                verticalAlign: "top",
                color: "red",
              }}
            >{`${rows.length ? getFixed(debitTurnover, 8) : "0"}`}</td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
            ></td>
          </tr>

          <tr
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
              }}
            ></td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
              colSpan={4}
            >{`Credit turnover`}</td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                textAlign: "right",
                verticalAlign: "top",
                color: "green",
              }}
            >{`${rows.length ? getFixed(creditTurnover, 8) : "0"}`}</td>
            <td
              style={{
                padding: "8px",
                border: "1px solid darkgray",
                textAlign: "right",
                verticalAlign: "top",
              }}
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatementReport;
