import Image from "next/image";
import React from "react";
import Checked from "../../assets/general/checked.png";
import Warning from "../../assets/general/alert.png";

type PaymentSuccessProps = {
  paymentData: any; // Define the type of paymentData here
};

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ paymentData }) => {
  console.log("Data from WebSocket in PaymentSuccess:", paymentData);
  console.log("paymentData.exactAmount", paymentData.exactAmount);
  console.log("paymentData.amount", paymentData.amount);

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-gray-100">
      <div className="flex w-[90vw] flex-col items-center gap-1 px-10 py-5 text-sm font-semibold md:w-[60vw] lg:w-[40vw]">
        <div
          className={`w-[600px] rounded-lg border-b-4 bg-white p-8 shadow-lg ${
            paymentData.amount < paymentData.exactAmount * 0.98
              ? "border-[#c1922e]"
              : "border-[#339900]"
          } `}
        >
          {paymentData.amount < paymentData.exactAmount * 0.98 ? (
            <div className="flex flex-col items-center gap-4">
              <Image src={Warning} alt="Success Icon" className="h-16 w-16" />
              <h2 className="text-2xl text-black">Transaction Completed </h2>
              <p className="text-gray-800">
                <span className="font-bold text-black">Note:</span> Your
                Transaction is completed.
              </p>

              <p className=" text-center text-gray-800">
                Warning: Your transaction is completed but the amount received
                is{" "}
                <span className=" text-base font-bold text-black">
                  {paymentData?.amount} {""}
                </span>
                ({paymentData?.assetId}) less than the expected amount{" "}
                <span className=" text-base font-bold">
                  {paymentData?.exactAmount} {""}
                </span>
                ({paymentData?.assetId})
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Image src={Checked} alt="Success Icon" className="h-16 w-16" />
              <h2 className="text-2xl text-black">
                Transaction was successful{" "}
              </h2>
              <p className="text-gray-800">Thank you for your payment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
