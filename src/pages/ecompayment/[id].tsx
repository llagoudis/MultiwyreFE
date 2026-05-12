// InvoicePaymentPage.tsx
import React, { useState } from "react";
import EcomInvoicePayTwo from "~/components/ecominvoice/EcomInvoicePayTwo";
import EcomInvoiceScannerTwo from "~/components/ecominvoice/EcomInvoiceScannerTwo";
import EcomInvoiceSuccess from "~/components/ecominvoice/EcomInvoiceSuccess";

const InvoicePaymentPage = () => {
  const [openAdd, setOpenAdd] = useState<string>("pay");
  const [apiResponseData, setApiResponseData] = useState<any>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  const handleInvoiceSubmission = (details: any) => {
    setInvoiceDetails(details);
    setOpenAdd("scanner");
  };

  return (
    <div>
      {openAdd === "pay" && (
        <EcomInvoicePayTwo
          onClose={(value: any) => {
            if (value === "scanner") {
              setOpenAdd(value);
            } else if (value === "success") {
              setOpenAdd(value);
            } else {
              setOpenAdd("");
            }
          }}
          openAdd={openAdd}
          setApiResponseData={setApiResponseData}
          onSubmitFee={handleInvoiceSubmission}
        />
      )}

      {openAdd === "scanner" && (
        <EcomInvoiceScannerTwo
          onClose={(value: any, status?: any) => {
            if (value === "pay") {
              setOpenAdd(value);
            } else if (value === "success") {
              setOpenAdd(value);
              setStatusData(status);
            } else {
              setOpenAdd("");
            }
          }}
          openAdd={openAdd}
          apiResponseData={apiResponseData}
          invoiceDetails={invoiceDetails}
        />
      )}

      {openAdd === "success" && (
        <EcomInvoiceSuccess
          onClose={(value: any) => {
            if (value === "pay") {
              setOpenAdd(value);
            } else if (value === "success") {
              setOpenAdd(value);
            } else {
              setOpenAdd("");
            }
          }}
          openAdd={""}
          apiResponseData={apiResponseData}
          statusData={statusData}
        />
      )}
    </div>
  );
};

export default InvoicePaymentPage;
