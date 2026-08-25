/* eslint-disable @next/next/no-img-element */

import React from "react";
import { formatDateTime, TEST_COINS } from "~/helpers/helper";

interface ReconciliationReportProps {
  row: any;
}
[];

const ReconciliationReportOTCsafari: React.FC<ReconciliationReportProps> = ({
  row,
}) => {
  function getFlooredFixed(v: any, asset: string) {
    let d = 2;
    if (asset === TEST_COINS.BTC_TEST || asset === TEST_COINS.BTC) {
      d = 6;
    }

    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }

  function assetSymbol(asset: string) {
    return asset === TEST_COINS.BTC_TEST || asset === TEST_COINS.BTC
      ? "₿"
      : asset === TEST_COINS.ETH_TEST5 ||
          asset === TEST_COINS.ETC_TEST ||
          asset === TEST_COINS.ETH
        ? "Ξ"
        : asset === TEST_COINS.USDT_BSC_TEST ||
            asset === TEST_COINS.USDC_ETH_TEST5_AN74 ||
            asset === TEST_COINS.USDC_ERC20 ||
            asset === TEST_COINS.USDC_POLYGON ||
            asset === TEST_COINS.USDC ||
            asset === TEST_COINS.USDT
          ? "$"
          : asset === TEST_COINS.EUR
            ? "€"
            : asset === TEST_COINS.TRX_TEST ||
                asset === TEST_COINS.TRX_USDT_S2UZ
              ? "$"
              : "";
  }

  return (
    <div style={{ padding: "5rem" }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
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
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{ display: "flex", alignItems: "center", height: "25px" }}
            >
              <p
                style={{
                  margin: "0 15px 0 0",
                  width: "60px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#ff0000",
                }}
              >
                CLIENT:
              </p>
              <p
                style={{
                  border: "3px solid #000000",
                  flex: 1,
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: "0",
                  padding: "2px 10px",
                }}
              >
                {row?.clientName}
              </p>
            </div>

            <div
              style={{ display: "flex", alignItems: "center", height: "25px" }}
            >
              <p
                style={{
                  margin: "0 15px 0 0",
                  width: "60px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#ff0000",
                }}
              >
                DATE:
              </p>
              <p
                style={{
                  border: "3px solid #000000",
                  flex: 1,
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: "0",
                  padding: "2px 0",
                }}
              >
                {formatDateTime(row?.createdAt)}
              </p>
            </div>
          </div>

          <img
            style={{
              width: "auto",
              objectFit: "contain",
              height: "75px",
              marginLeft: "1rem",
              position: "relative",
            }}
            src={row?.adminImage}
            alt="logo"
          />
        </div>
      </div>

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
              }}
            >
              <i style={{ fontSize: "12px", lineHeight: "10px" }}>
                Client Name
              </i>
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
                Exchange fee
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

            {row?.toAssetId === TEST_COINS.EUR && (
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
                  Net Amount
                </span>
              </th>
            )}
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
              <span style={{ fontSize: "12px" }}>{row?.clientName}</span>
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
              <div
                style={{
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "700",
                }}
              >
                <span>{assetSymbol(row?.fromAssetId)} </span>
                <span>
                  {getFlooredFixed(row?.debitedAmount, row?.fromAssetId)}
                </span>
              </div>
            </td>
            {/* exchange fee */}
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
              <div
                style={{
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{assetSymbol(row?.exchangeFeeCurrency)}</span>
                <span>
                  {getFlooredFixed(row?.exchangeFee, row?.exchangeFeeCurrency)}
                </span>
              </div>
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
              <div
                style={{
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span> {assetSymbol(row?.fromAssetId)} </span>
                <span>
                  {getFlooredFixed(row?.amountForExchange, row?.fromAssetId)}
                </span>
              </div>
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
                style={{
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{assetSymbol(row?.trxFeeCurrency)}</span>
                <span>
                  {getFlooredFixed(row?.transactionFee, row?.trxFeeCurrency)}
                </span>
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
                style={{
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {row?.type === "sell"
                    ? assetSymbol(row?.toAssetId)
                    : assetSymbol(row?.fromAssetId)}{" "}
                </span>
                <span>{row?.clientRate}</span>
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
                style={{
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{assetSymbol(row?.toAssetId)}</span>
                <span>
                  {getFlooredFixed(row?.creditedAmount, row?.toAssetId)}
                </span>
              </div>
            </td>

            {/* Net Amount  */}
            {row?.toAssetId === TEST_COINS.EUR && (
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
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{assetSymbol(row?.toAssetId)}</span>
                  <span>{getFlooredFixed(row?.netAmount, row?.toAssetId)}</span>
                </div>
              </td>
            )}
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          {/* BLK EXCHANGE FEES */}
          <tr style={{ fontSize: "10px", color: "#ff0000", fontWeight: "500" }}>
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
                EXCHANGE FEES
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
              <span style={{ fontSize: "14px" }}>{row?.trxFeeCurrency}</span>
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{assetSymbol(row?.trxFeeCurrency)}</span>
                {getFlooredFixed(row?.transactionFee, row?.trxFeeCurrency)}
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
                <i> Banking Fee ({row?.bankingFeePercent}%)</i>
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
              {row?.isConversionRequiredForBankingFee ? (
                <div
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {assetSymbol(row?.bankingFeeCurrency)}
                  <span>
                    {getFlooredFixed(row?.bankingFee, row?.bankingFeeCurrency)}
                  </span>
                </div>
              ) : (
                <span></span>
              )}
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
              {row?.isConversionRequiredForBankingFee ? (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{assetSymbol(row?.trxFeeCurrency)}</span>
                  <span>
                    {getFlooredFixed(
                      row?.bankingFee * row?.clientRate,
                      row?.trxFeeCurrency,
                    )}
                  </span>
                </div>
              ) : (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{assetSymbol(row?.bankingFeeCurrency)}</span>
                  <span>
                    {getFlooredFixed(row?.bankingFee, row?.bankingFeeCurrency)}
                  </span>
                </div>
              )}
            </td>
          </tr>
          {/* Exchange fee */}
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
                <i>Exchange Fee ({row?.exchangeFeePercent}%) </i>
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
              {row?.isConversionRequiredForExchangeFee ? (
                <div
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {assetSymbol(row?.exchangeFeeCurrency)}
                  <span>
                    {getFlooredFixed(
                      row?.exchangeFee,
                      row?.exchangeFeeCurrency,
                    )}
                  </span>
                </div>
              ) : (
                <span></span>
              )}
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
              {row?.isConversionRequiredForExchangeFee ? (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{assetSymbol(row?.trxFeeCurrency)}</span>
                  <span>
                    {getFlooredFixed(
                      row?.exchangeFee * row?.clientRate,
                      row?.trxFeeCurrency,
                    )}
                  </span>
                </div>
              ) : (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {assetSymbol(row?.exchangeFeeCurrency)}
                  <span>
                    {getFlooredFixed(
                      row?.exchangeFee,
                      row?.exchangeFeeCurrency,
                    )}
                  </span>
                </div>
              )}
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
              <span style={{ fontSize: "12px" }}></span>
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
                {row?.type === "sell"
                  ? assetSymbol(row?.toAssetId)
                  : assetSymbol(row?.fromAssetId)}
                <span>
                  <i>{row?.clientRate}</i>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

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

export default ReconciliationReportOTCsafari;
