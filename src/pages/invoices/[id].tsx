import React, { useState } from "react";
import InvoicePay from "~/components/invoices/InvoicePay";
import InvoiceScanner from "~/components/invoices/InvoiceScanner";
import PaymentSuccess from "~/components/invoices/PaymentSuccess";
import TransactionExpired from "~/components/invoices/TransactionExpired";

const InvoicePayemntPage = () => {
  const [openAdd, setOpenAdd] = useState<string>("pay");
  const [updateOnTransition, setUpdateOnTransition] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  const handleClose = (value: any) => {
    setOpenAdd(value);
    if (value === "scanner") {
      setUpdateOnTransition(true);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    setPaymentData(data);
    console.log("Data from WebSocket:", data);
    setPaymentStatus("success");
  };

  const handleTimerComplete = () => {
    setPaymentStatus("expired");
  };

  const handleInvoiceSubmission = (details: any) => {
    setInvoiceDetails(details);
    setOpenAdd("scanner");
  };

  if (paymentStatus === "success") {
    return <PaymentSuccess paymentData={paymentData} />;
  }

  if (paymentStatus === "expired") {
    return <TransactionExpired />;
  }
  return (
    <div>
      {openAdd === "pay" && (
        <InvoicePay
          onClose={handleClose}
          openAdd={openAdd}
          onSubmitFee={handleInvoiceSubmission}
        />
      )}

      {openAdd === "scanner" && (
        <InvoiceScanner
          onClose={handleClose}
          openAdd={openAdd}
          updateOnTransition={updateOnTransition}
          onPaymentSuccess={handlePaymentSuccess}
          onTimerComplete={handleTimerComplete}
          invoiceDetails={invoiceDetails}
        />
      )}
    </div>
  );
};

export default InvoicePayemntPage;
