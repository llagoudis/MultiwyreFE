import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import UploadCSV from "./UploadCSV";
import PaymentHistory from "./PaymentHistory";

const BulkPayout = () => {
  const Tabs = ["Upload CSV", "Payment History"];
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Slno,Amount,Wallet Address\n1\n2\n3";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bulk_Payout_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="m-auto my-2 w-full">
      <TabGroup>
        <TabList className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {Tabs.map((item) => (
              <Tab
                key={item}
                className={({ selected }) =>
                  classNames(
                    "rounded-md px-5 py-2.5 text-sm font-semibold transition focus:outline-none",
                    selected
                      ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow"
                      : "text-white hover:bg-slate-50",
                  )
                }
              >
                {item}
              </Tab>
            ))}
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-2 rounded-md border border-pink-500 px-4 py-2 text-sm font-semibold text-whitetransition hover:bg-pink-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"
                stroke="#DB33A1"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M14 3v5h5" stroke="#DB33A1" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 13h6M9 17h4" stroke="#DB33A1" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Download CSV Template
          </button>
        </TabList>

        <TabPanels className="mt-5">
          <TabPanel>
            <UploadCSV />
          </TabPanel>
          <TabPanel>
            <PaymentHistory />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default BulkPayout;
