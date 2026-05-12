import Link from "next/link";
import React, { forwardRef } from "react";

export const InvoiceTemplateSafari = forwardRef<
  HTMLDivElement,
  InvoiceTemplateProps
>(
  (
    { invoice, addressDetails, qrImage, bankDetails, invoiceImageUrl, base64 },
    ref,
  ) => {
    // console.log({ invoice, addressDetails, bankDetails, invoiceImageUrl });
    const formatInvoiceDate = (dateString: string | undefined): string => {
      if (!dateString) return "";

      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();

      // Add ordinal suffix to day
      const getOrdinalSuffix = (day: number): string => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };

      return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
    };

    // Helper function to format amount to 2 decimal places
    const formatAmount = (amount: string | number): string => {
      const numAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return "0,00";
      // Format with European style
      return numAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    return (
      <div
        style={{
          background: "#fff",
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          fontFamily: "Arial, sans-serif",
          color: "#000",
        }}
      >
        <div className="flex justify-between">
          <div className="flex w-[25%] flex-col gap-4">
            <div className="as">
              <p className="text-xs font-semibold">From</p>
              <p className="mt-1 text-xs">
                {invoiceImageUrl?.firstname + " " + invoiceImageUrl?.lastname}
              </p>
              <p className="mt-1 text-xs">{addressDetails?.addressLine1}</p>
              <p className="mt-1 text-xs">{addressDetails?.addressLine2}</p>
              <p className="mt-1 text-xs">
                {addressDetails?.city}, {addressDetails?.state},{" "}
                {addressDetails?.country}, {addressDetails?.postalCode}
              </p>
            </div>

            <p className="text-xs font-semibold">INVOICE</p>

            <div className="as">
              <p className="text-xs font-semibold">Bill To:</p>
              <p className="mt-1 text-xs">{invoice?.name}</p>
              <p className="mt-1 text-xs">
                {invoice?.billingAddress ? ` ${invoice.billingAddress}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {base64 ? (
              <img
                src={base64}
                alt="Company Logo"
                width={200}
                height={160}
                className="h-auto max-h-[160px] object-contain"
              />
            ) : (
              <div className="flex h-[160px] w-[200px] items-center justify-center border border-gray-300 bg-gray-100">
                <p className="text-xs text-gray-500">No logo available</p>
              </div>
            )}
            <p className="text-xs font-semibold">
              Invoice Date :{" "}
              <span className="font-normal">
                {formatInvoiceDate(invoice?.createdAt)}
              </span>
            </p>
            <p className="text-xs font-semibold">
              Invoice Number :{" "}
              <span className="font-normal">{invoice?.id}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 flex items-center justify-between border-b-2 border-black pb-2 text-xs font-bold">
          <p>Description</p>
          <p className="whitespace-nowrap"> Amount {invoice?.fiatCurrency}</p>
        </div>

        {/* Dynamic billing items */}
        {invoice?.billingItems?.map((item, index) => (
          <div
            key={index}
            className="mt-4 flex items-start justify-between border-b pb-2 text-xs"
          >
            <div>
              <p className=" whitespace-nowrap">{item.description}</p>
            </div>
            <p>{formatAmount(item.amount)}</p>
          </div>
        ))}

        <div className="mt-3 flex justify-end text-xs">
          <p>{formatAmount(invoice?.fiatAmount ?? 0)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 justify-between gap-4">
          <div className="as"></div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b-2 border-black pb-2">
              <p className="text-[11px] font-semibold">Subtotal</p>
              <p className="text-xs">
                {formatAmount(invoice?.fiatAmount ?? 0)}
              </p>
            </div>
            <div className="mt-2 flex justify-between">
              <p className=" whitespace-nowrap text-[11px] font-semibold">
                TOTAL {invoice?.fiatCurrency}
              </p>
              <p className="text-xs">
                {formatAmount(invoice?.fiatAmount ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* QR code and payment details */}
        <div className="mt-4 flex flex-col justify-center gap-3">
          <p className="text-[11px] font-semibold">Pay this Invoice online</p>
          {qrImage ? (
            <img src={qrImage} alt="QR Code" width={120} height={120} />
          ) : (
            <div className="flex h-[120px] w-[120px] items-center justify-center border border-gray-300 bg-gray-100">
              <p className="text-xs text-gray-500">No URL available</p>
            </div>
          )}
          {/* <p className="text-xs">
            Scan the code with the camera on your mobile device or{" "}
            <Link
              className="font-semibold text-[#0216CD]"
              href={invoice?.invoiceURL ?? "#"}
            >
              click here to pay online
            </Link>{" "}
          </p> */}
          {invoice?.invoiceURL && (
            <div className="payment-button-container mt-2">
              {/* Add container class */}
              <div className="flex gap-1 text-xs">
                <p className=" whitespace-nowrap">
                  Scan the code with the camera on your mobile device or
                </p>
                <a
                  className=" font-semibold text-[#0216CD]"
                  href={invoice?.invoiceURL}
                >
                  click here to pay online
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs font-semibold">Bank Details</p>
          <div className="flex flex-col gap-2 text-xs">
            <p>Account Name: {bankDetails?.bankName}</p>
            <p>IBAN Number: {bankDetails?.IBAN}</p>
            <p>SWIFT Code: {bankDetails?.swift} </p>
            <p>
              Bank: {bankDetails?.bankAddress} , {bankDetails?.bankLocation} ,{" "}
              {bankDetails?.bankCountry}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

InvoiceTemplateSafari.displayName = "InvoiceTemplateSafari";

export default InvoiceTemplateSafari;
