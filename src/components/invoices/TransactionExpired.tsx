import Image from "next/image";
import React from "react";
import Close from "../../assets/general/close.png";
import { useRouter } from "next/router";

const TransactionExpired = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.reload();
  };
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-gray-100">
      <div className="flex w-[90vw] flex-col items-center gap-1 px-10 py-5 text-sm font-semibold md:w-[60vw] lg:w-[40vw]">
        <div className=" w-[400px] rounded-lg border-b-4 border-red-500 bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <Image src={Close} alt="Success Icon" className="h-16 w-16" />
            <h2 className="text-2xl text-black">Transaction Timed Out</h2>
            <p className="text-gray-800">
              Your session has timed out. Please try again.
            </p>
            <button
              onClick={handleBackClick}
              className="duration-250 rounded-lg border border-red-500 bg-white px-6 py-3 font-semibold text-black transition hover:border-gray-400 hover:text-gray-700 hover:shadow-md active:bg-gray-100"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionExpired;
