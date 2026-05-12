/* eslint-disable @next/next/no-img-element */
import Image, { StaticImageData } from "next/image";
import React from "react";
import { tableFormatDate } from "~/helpers/helper";
import Logo from "~/assets/images/xchange-360-logo.png";
interface ReconciliationReportProps {
  row: any;
}
[];

const ReconciliationReport: React.FC<ReconciliationReportProps> = ({ row }) => {
  function getFlooredFixed(v: any, d: any) {
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }

  return (
    <div style={{ width: "90%", margin: "2rem auto" }}>
      <div
        style={{
          display: "flex",
          margin: " 1rem 0",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "end",
        }}
      >
        <div>
          <p
            style={{ fontSize: "1.2rem", color: "#ff0000", fontWeight: "700" }}
          >
            Reconciliation REPORT
          </p>
          <br></br>
        </div>
        <div>
          <div style={{ display: "flex", height: "25px" }}>
            <p
              style={{
                padding: "0",
                margin: "0 15px 0px 0",
                width: "50px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#ff0000",
                lineHeight: "10px",
              }}
            >
              CLIENT:
            </p>
            <p
              style={{
                borderTop: "3px solid #000000",
                borderRight: "3px solid #000000",
                borderLeft: "3px solid #000000",
                minWidth: "250px",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "600",
                margin: "0",
                paddingBottom: "5px",
                lineHeight: "10px",
              }}
            >
              {row?.User?.firstname} {row?.User?.lastname}
            </p>
          </div>
          <div style={{ display: "flex", height: "25px" }}>
            <p
              style={{
                padding: "0",
                margin: "0 15px 0 0",
                width: "50px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#ff0000",
                lineHeight: "10px",
              }}
            >
              DATE:
            </p>
            <p
              style={{
                border: "3px solid #000000",
                minWidth: "250px",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "600",
                margin: "0",
                padding: "0",
                lineHeight: "10px",
              }}
            >
              {tableFormatDate(row?.createdAt)}
            </p>
          </div>
        </div>

        {/* <Image
          style={{
            width: "auto",
            objectFit: "contain",
            height: "75px",
            marginLeft: "1rem",
            position: "relative",
          }}
          // unoptimized
          width={100}
          height={100}
          src={row?.adminImage as StaticImageData}
          alt="logo"
        /> */}

        <Image alt={"Profile"} src={Logo} width={80} height={60} />
      </div>

      <div style={{ margin: "1rem 0" }}>
        <table>
          <thead>
            <tr
              style={{
                fontSize: "1rem",
                color: "#ff0000",
                fontWeight: "600",
              }}
            >
              <th
                style={{
                  padding: "0 5px 15px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "3px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "150px",
                  textAlign: "start",
                }}
              >
                <p style={{ fontSize: "12px", lineHeight: "10px" }}>
                  <i>Client Name</i>
                </p>
              </th>
              <th
                style={{
                  padding: "0 5px 15px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "130px",
                }}
              >
                <span style={{ fontSize: "12px", lineHeight: "10px" }}>
                  CLIENT FUNDS SEND
                </span>
              </th>
              <th
                style={{
                  padding: "0 5px 15px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                }}
              >
                <span style={{ fontSize: "12px", lineHeight: "10px" }}>
                  TRADE fee
                </span>
              </th>
              <th
                style={{
                  padding: "0 5px 15px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                }}
              >
                <span style={{ fontSize: "12px", lineHeight: "10px" }}>
                  Amount for EXCHANGE
                </span>
              </th>
              <th
                style={{
                  padding: "0 5px 15px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                }}
              >
                <span style={{ fontSize: "12px", lineHeight: "10px" }}>
                  TRX Fee
                </span>
              </th>
              <th
                style={{
                  padding: "0 5px 15px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                }}
              >
                <span style={{ fontSize: "12px", lineHeight: "10px" }}>
                  Exchange rate
                </span>
              </th>
              <th
                style={{
                  padding: "0 5px 15px",
                  borderTop: "3px solid #000000",
                  borderRight: "3px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                }}
              >
                <span style={{ fontSize: "12px", lineHeight: "10px" }}>
                  Exchange amount
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontWeight: "500" }}>
              {/* Client name */}
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "3px solid #000000",
                  borderBottom: "3px solid #000000",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  {row?.User?.firstname} {row?.User?.lastname}
                </span>
              </td>
              {/* Client fund send */}
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  textAlign: "end",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: "700" }}>
                  {row?.assetId === "BTC_TEST"
                    ? "₿"
                    : row?.assetId === "ETC_TEST"
                    ? "Ξ"
                    : row?.assetId === "TRX_TEST"
                    ? "₮"
                    : row?.assetId === "USDC_TEST3"
                    ? "$"
                    : row?.assetId === "USDT_BSC_TEST"
                    ? "$"
                    : row?.assetId === "ETH_TEST5"
                    ? "Ξ"
                    : row?.assetId === "EUR"
                    ? "€"
                    : ""}
                  {row?.assetId === "BTC_TEST"
                    ? getFlooredFixed(row?.TransactionFee?.debitedAmount, 6)
                    : getFlooredFixed(row?.TransactionFee?.debitedAmount, 2)}
                </span>
              </td>
              {/* trade fee */}
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  textAlign: "end",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  {row?.assetId === "BTC_TEST"
                    ? "₿"
                    : row?.assetId === "ETC_TEST"
                    ? "Ξ"
                    : row?.assetId === "TRX_TEST"
                    ? "₮"
                    : row?.assetId === "USDC_TEST3"
                    ? "$"
                    : row?.assetId === "USDT_BSC_TEST"
                    ? "$"
                    : row?.assetId === "ETH_TEST5"
                    ? "Ξ"
                    : row?.assetId === "EUR"
                    ? "€"
                    : ""}
                  {/* {row?.TransactionFee?.exchangeFee} */}

                  {/* {row?.destinationAssetId === "BTC_TEST"
                    ? Number(row?.TransactionFee?.exchangeFee).toFixed(6)
                    : Number(row?.TransactionFee?.exchangeFee).toFixed(2)} */}

                  {row?.destinationAssetId === "BTC_TEST"
                    ? getFlooredFixed(row?.TransactionFee?.exchangeFee, 6)
                    : getFlooredFixed(row?.TransactionFee?.exchangeFee, 2)}
                </span>
              </td>
              {/* Amount for EXCHANGE */}
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  textAlign: "end",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  {row?.assetId === "BTC_TEST"
                    ? "₿"
                    : row?.assetId === "ETC_TEST"
                    ? "Ξ"
                    : row?.assetId === "TRX_TEST"
                    ? "₮"
                    : row?.assetId === "USDC_TEST3"
                    ? "$"
                    : row?.assetId === "USDT_BSC_TEST"
                    ? "$"
                    : row?.assetId === "ETH_TEST5"
                    ? "Ξ"
                    : row?.assetId === "EUR"
                    ? "€"
                    : ""}

                  {/* {row?.assetId === "BTC_TEST"
                    ? (
                        Number(row?.TransactionFee?.debitedAmount) -
                        Number(row?.TransactionFee?.exchangeFee)
                      ).toFixed(6)
                    : (
                        Number(row?.TransactionFee?.debitedAmount) -
                        Number(row?.TransactionFee?.exchangeFee)
                      ).toFixed(2)} */}

                  {row?.assetId === "BTC_TEST"
                    ? String(
                        getFlooredFixed(
                          (Number(row?.TransactionFee?.debitedAmount) || 0) -
                            (Number(row?.TransactionFee?.exchangeFee) || 0),
                          6,
                        ),
                      )
                    : String(
                        getFlooredFixed(
                          (Number(row?.TransactionFee?.debitedAmount) || 0) -
                            (Number(row?.TransactionFee?.exchangeFee) || 0),
                          2,
                        ),
                      )}
                </span>
              </td>
              {/* TRX Fee */}
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  textAlign: "end",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {row?.TransactionFee?.type === "sell"
                      ? (row?.destinationAssetId === "BTC_TEST" && "₿") ||
                        (row?.destinationAssetId === "ETC_TEST" && "Ξ") ||
                        (row?.destinationAssetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.destinationAssetId,
                        ) &&
                          "$") ||
                        (row?.destinationAssetId === "ETH_TEST5" && "Ξ") ||
                        (row?.destinationAssetId === "EUR" && "€")
                      : (row?.assetId === "BTC_TEST" && "₿") ||
                        (row?.assetId === "ETC_TEST" && "Ξ") ||
                        (row?.assetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.assetId,
                        ) &&
                          "$") ||
                        (row?.assetId === "ETH_TEST5" && "Ξ") ||
                        (row?.assetId === "EUR" && "€")}
                  </span>
                  {/* {row?.destinationAssetId === "BTC_TEST"
                    ? Number(row?.TransactionFee?.transactionFee).toFixed(6)
                    : Number(row?.TransactionFee?.transactionFee).toFixed(2)} */}

                  {row?.assetId === "BTC_TEST"
                    ? getFlooredFixed(row?.TransactionFee?.transactionFee, 6)
                    : getFlooredFixed(row?.TransactionFee?.transactionFee, 2)}
                </div>
              </td>
              {/* Exchange rate */}
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  textAlign: "end",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {row?.TransactionFee?.type === "sell"
                      ? (row?.destinationAssetId === "BTC_TEST" && "₿") ||
                        (row?.destinationAssetId === "ETC_TEST" && "Ξ") ||
                        (row?.destinationAssetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.destinationAssetId,
                        ) &&
                          "$") ||
                        (row?.destinationAssetId === "ETH_TEST5" && "Ξ") ||
                        (row?.destinationAssetId === "EUR" && "€")
                      : (row?.assetId === "BTC_TEST" && "₿") ||
                        (row?.assetId === "ETC_TEST" && "Ξ") ||
                        (row?.assetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.assetId,
                        ) &&
                          "$") ||
                        (row?.assetId === "ETH_TEST5" && "Ξ") ||
                        (row?.assetId === "EUR" && "€")}
                  </span>
                  {/* {row?.TransactionFee?.clientRate} */}
                  {/* {row?.assetId === "BTC_TEST"
                    ? Number(row?.TransactionFee?.clientRate).toFixed(6)
                    : Number(row?.TransactionFee?.clientRate).toFixed(2)} */}

                  {row?.assetId === "BTC_TEST"
                    ? getFlooredFixed(row?.TransactionFee?.clientRate, 6)
                    : getFlooredFixed(row?.TransactionFee?.clientRate, 2)}
                </div>
              </td>
              {/* Exchange amount */}
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "3px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  textAlign: "end",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {row?.destinationAssetId === "BTC_TEST"
                      ? "₿"
                      : row?.destinationAssetId === "ETC_TEST"
                      ? "Ξ"
                      : row?.destinationAssetId === "TRX_TEST"
                      ? "₮"
                      : row?.destinationAssetId === "USDC_TEST3"
                      ? "$"
                      : row?.destinationAssetId === "USDT_BSC_TEST"
                      ? "$"
                      : row?.destinationAssetId === "ETH_TEST5"
                      ? "Ξ"
                      : row?.destinationAssetId === "EUR"
                      ? "€"
                      : ""}
                  </span>
                  <span>
                    {/* {row?.TransactionFee?.creditedAmount} */}

                    {/* {row?.destinationAssetId === "BTC_TEST"
                      ? Number(row?.TransactionFee?.creditedAmount).toFixed(6)
                      : Number(row?.TransactionFee?.creditedAmount).toFixed(2)} */}

                    {row?.destinationAssetId === "BTC_TEST"
                      ? getFlooredFixed(row?.TransactionFee?.creditedAmount, 6)
                      : getFlooredFixed(row?.TransactionFee?.creditedAmount, 2)}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <table>
          <thead>
            {/* BLK TRADE FEES */}
            <tr
              style={{ fontSize: "10px", color: "#ff0000", fontWeight: "500" }}
            >
              <th
                style={{
                  padding: "0 5px 10px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "3px solid #000000",
                  borderBottom: "1px solid #000000",
                  textAlign: "start",
                  minWidth: "150px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  TRADE FEES
                </span>
              </th>
              <th
                style={{
                  padding: "0 5px 10px",
                  borderTop: "3px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "130px",
                }}
              ></th>
              <th
                style={{
                  padding: "0 5px 10px",
                  borderTop: "3px solid #000000",
                  borderRight: "3px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                }}
              >
                <span style={{ fontSize: "14px" }}>
                  {row?.destinationAssetId}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* TRX Fee */}
            <tr style={{ fontWeight: "500" }}>
              <th
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "3px solid #000000",
                  borderBottom: "1px solid #000000",
                  color: "#ff0000",
                  textAlign: "start",
                  minWidth: "150px",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  <i>TRX Fee</i>
                </span>
              </th>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                  textAlign: "end",
                }}
              >
                <span style={{ fontSize: "12px" }}></span>
              </td>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "3px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                  fontSize: "12px",
                  textAlign: "end",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {row?.TransactionFee?.type === "sell"
                      ? (row?.destinationAssetId === "BTC_TEST" && "₿") ||
                        (row?.destinationAssetId === "ETC_TEST" && "Ξ") ||
                        (row?.destinationAssetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.destinationAssetId,
                        ) &&
                          "$") ||
                        (row?.destinationAssetId === "ETH_TEST5" && "Ξ") ||
                        (row?.destinationAssetId === "EUR" && "€")
                      : (row?.assetId === "BTC_TEST" && "₿") ||
                        (row?.assetId === "ETC_TEST" && "Ξ") ||
                        (row?.assetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.assetId,
                        ) &&
                          "$") ||
                        (row?.assetId === "ETH_TEST5" && "Ξ") ||
                        (row?.assetId === "EUR" && "€")}
                  </span>
                  {/* {row?.TransactionFee?.transactionFee} */}
                  {/* {row?.destinationAssetId === "BTC_TEST"
                    ? Number(row?.TransactionFee?.transactionFee).toFixed(6)
                    : Number(row?.TransactionFee?.transactionFee).toFixed(2)} */}

                  {row?.assetId === "BTC_TEST"
                    ? getFlooredFixed(row?.TransactionFee?.transactionFee, 6)
                    : getFlooredFixed(row?.TransactionFee?.transactionFee, 2)}
                </div>
              </td>
            </tr>
            {/* Banking fees */}
            <tr style={{ fontSize: "10px", fontWeight: "500" }}>
              <th
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "3px solid #000000",
                  borderBottom: "1px solid #000000",
                  color: "#ff0000",
                  textAlign: "start",
                  minWidth: "150px",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  <i>Banking fees</i>
                </span>
              </th>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                  textAlign: "end",
                }}
              >
                <span style={{ fontSize: "12px" }}>0.00%</span>
              </td>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "3px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                  fontSize: "12px",
                  textAlign: "end",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {row?.TransactionFee?.type === "sell"
                      ? (row?.destinationAssetId === "BTC_TEST" && "₿") ||
                        (row?.destinationAssetId === "ETC_TEST" && "Ξ") ||
                        (row?.destinationAssetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.destinationAssetId,
                        ) &&
                          "$") ||
                        (row?.destinationAssetId === "ETH_TEST5" && "Ξ") ||
                        (row?.destinationAssetId === "EUR" && "€")
                      : (row?.assetId === "BTC_TEST" && "₿") ||
                        (row?.assetId === "ETC_TEST" && "Ξ") ||
                        (row?.assetId === "TRX_TEST" && "₮") ||
                        (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                          row?.assetId,
                        ) &&
                          "$") ||
                        (row?.assetId === "ETH_TEST5" && "Ξ") ||
                        (row?.assetId === "EUR" && "€")}
                  </span>
                  <span> 0.00</span>
                </div>
              </td>
            </tr>
            {/* Exchange fee - 2% */}
            <tr style={{ fontWeight: "500" }}>
              <th
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "3px solid #000000",
                  borderBottom: "1px solid #000000",
                  color: "#ff0000",
                  textAlign: "start",
                  minWidth: "150px",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  <i>Exchange fee - 2%</i>
                </span>
              </th>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                  textAlign: "end",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  {row?.destinationAssetId === "BTC_TEST"
                    ? "₿"
                    : row?.destinationAssetId === "ETC_TEST"
                    ? "Ξ"
                    : row?.destinationAssetId === "TRX_TEST"
                    ? "₮"
                    : row?.destinationAssetId === "USDC_TEST3"
                    ? "$"
                    : row?.destinationAssetId === "USDT_BSC_TEST"
                    ? "$"
                    : row?.destinationAssetId === "ETH_TEST5"
                    ? "Ξ"
                    : row?.destinationAssetId === "EUR"
                    ? "€"
                    : ""}
                  {/* {row?.TransactionFee?.exchangeFee *
                    row?.TransactionFee?.debitedAmount} */}
                  {row?.destinationAssetId === "BTC_TEST"
                    ? (
                        Math.floor(
                          Number(row?.TransactionFee?.exchangeFee) *
                            Number(row?.TransactionFee?.debitedAmount) *
                            Math.pow(10, 6),
                        ) / Math.pow(10, 6)
                      ).toFixed(6)
                    : (
                        Math.floor(
                          Number(row?.TransactionFee?.exchangeFee) *
                            Number(row?.TransactionFee?.debitedAmount) *
                            Math.pow(10, 2),
                        ) / Math.pow(10, 2)
                      ).toFixed(2)}

                  {/* {row?.destinationAssetId === "BTC_TEST"
                    ? String(
                        (Number(row?.TransactionFee?.exchangeFee) || 0) *
                          (Number(row?.TransactionFee?.debitedAmount) || 0),
                      ).split(".")[0] +
                      "." +
                      String(
                        (Number(row?.TransactionFee?.exchangeFee) || 0) *
                          (Number(row?.TransactionFee?.debitedAmount) || 0),
                      )
                        .split(".")[1]
                        ?.slice(0, 6)
                    : String(
                        (Number(row?.TransactionFee?.exchangeFee) || 0) *
                          (Number(row?.TransactionFee?.debitedAmount) || 0),
                      ).split(".")[0] +
                      "." +
                      String(
                        (Number(row?.TransactionFee?.exchangeFee) || 0) *
                          (Number(row?.TransactionFee?.debitedAmount) || 0),
                      )
                        .split(".")[1]
                        ?.slice(0, 2)} */}
                </span>
              </td>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "3px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  minWidth: "110px",
                  fontSize: "12px",
                  textAlign: "end",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {row?.TransactionFee?.type === "sell"
                    ? (row?.destinationAssetId === "BTC_TEST" && "₿") ||
                      (row?.destinationAssetId === "ETC_TEST" && "Ξ") ||
                      (row?.destinationAssetId === "TRX_TEST" && "₮") ||
                      (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                        row?.destinationAssetId,
                      ) &&
                        "$") ||
                      (row?.destinationAssetId === "ETH_TEST5" && "Ξ") ||
                      (row?.destinationAssetId === "EUR" && "€")
                    : (row?.assetId === "BTC_TEST" && "₿") ||
                      (row?.assetId === "ETC_TEST" && "Ξ") ||
                      (row?.assetId === "TRX_TEST" && "₮") ||
                      (["USDC_TEST3", "USDT_BSC_TEST"].includes(row?.assetId) &&
                        "$") ||
                      (row?.assetId === "ETH_TEST5" && "Ξ") ||
                      (row?.assetId === "EUR" && "€")}
                  <span>
                    {/* {row?.TransactionFee?.exchangeFee *
                      row?.TransactionFee?.clientRate} */}
                    {/* {row?.destinationAssetId === "BTC_TEST"
                      ? (
                          Number(row?.TransactionFee?.exchangeFee) *
                          Number(row?.TransactionFee?.clientRate)
                        ).toFixed(6)
                      : (
                          Number(row?.TransactionFee?.exchangeFee) *
                          Number(row?.TransactionFee?.clientRate)
                        ).toFixed(2)} */}

                    {row?.assetId === "BTC_TEST"
                      ? String(
                          getFlooredFixed(
                            (Number(row?.TransactionFee?.exchangeFee) || 0) *
                              (Number(row?.TransactionFee?.clientRate) || 0),
                            6,
                          ),
                        )
                      : String(
                          getFlooredFixed(
                            (Number(row?.TransactionFee?.exchangeFee) || 0) *
                              (Number(row?.TransactionFee?.clientRate) || 0),
                            2,
                          ),
                        )}
                  </span>
                </div>
              </td>
            </tr>
            {/* Exchange rate */}
            <tr style={{ fontWeight: "500" }}>
              <th
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "3px solid #000000",
                  borderBottom: "3px solid #000000",
                  color: "#ff0000",
                  textAlign: "start",
                  minWidth: "150px",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  <i>Exchange rate</i>
                </span>
              </th>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "2px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  minWidth: "110px",
                  textAlign: "end",
                }}
              >
                <span style={{ fontSize: "12px" }}>-</span>
              </td>
              <td
                style={{
                  padding: "0 5px 10px",
                  borderTop: "2px solid #000000",
                  borderRight: "3px solid #000000",
                  borderLeft: "1px solid #000000",
                  borderBottom: "3px solid #000000",
                  minWidth: "110px",
                  fontSize: "12px",
                  textAlign: "end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "700",
                  }}
                >
                  {row?.TransactionFee?.type === "sell"
                    ? (row?.destinationAssetId === "BTC_TEST" && "₿") ||
                      (row?.destinationAssetId === "ETC_TEST" && "Ξ") ||
                      (row?.destinationAssetId === "TRX_TEST" && "₮") ||
                      (["USDC_TEST3", "USDT_BSC_TEST"].includes(
                        row?.destinationAssetId,
                      ) &&
                        "$") ||
                      (row?.destinationAssetId === "ETH_TEST5" && "Ξ") ||
                      (row?.destinationAssetId === "EUR" && "€")
                    : (row?.assetId === "BTC_TEST" && "₿") ||
                      (row?.assetId === "ETC_TEST" && "Ξ") ||
                      (row?.assetId === "TRX_TEST" && "₮") ||
                      (["USDC_TEST3", "USDT_BSC_TEST"].includes(row?.assetId) &&
                        "$") ||
                      (row?.assetId === "ETH_TEST5" && "Ξ") ||
                      (row?.assetId === "EUR" && "€")}
                  <span>
                    <i>
                      {/* row?.TransactionFee?.clientRate */}
                      {/* {row?.destinationAssetId === "BTC_TEST"
                        ? Number(row?.TransactionFee?.clientRate).toFixed(6)
                        : Number(row?.TransactionFee?.clientRate).toFixed(2)} */}

                      {row?.assetId === "BTC_TEST"
                        ? getFlooredFixed(row?.TransactionFee?.clientRate, 6)
                        : getFlooredFixed(row?.TransactionFee?.clientRate, 2)}
                    </i>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          marginTop: "1rem",
          fontWeight: "700",
        }}
      >
        {row?.companyLegalName ?? "---"} operated by General Payments Gate
        Limited - Reg. Number BC1354852 & License number: M22457458
      </p>
    </div>
  );
};

export default ReconciliationReport;
