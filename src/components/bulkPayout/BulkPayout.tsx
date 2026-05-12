import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import UploadCSV from "./UploadCSV";
import PaymentHistory from "./PaymentHistory";
import MuiButton from "../MuiButton";
import Image from "next/image";
import csvicon from "../../assets/images/Group.svg";
const BulkPayout = () => {
  const Tabs = ["Upload CSV", "Payment History"];
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className=" ml-auto my-4 w-[95%]">
      <TabGroup>
        <TabList className="flex items-center justify-between gap-8 rounded-lg bg-white pt-2 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]">
          <div className="ml-20 flex items-center justify-around gap-20">
            {Tabs.map((item) => (
              <Tab
                key={item}
                className={({ selected }) =>
                  classNames(
                    "px-2 pb-5 pt-2.5 text-sm leading-5 text-black",
                    "focus:outline-none",
                    selected
                      ? "border-b-[3px] border-[#C1922E] pb-4 font-bold text-black"
                      : "font-medium text-black hover:text-black",
                  )
                }
              >
                <p className="w-fit">{item}</p>
              </Tab>
            ))}
          </div>

          <MuiButton
            name=""
            background="black"
            borderColor="black"
            onClick={() => {
              // Create a CSV file and trigger download
              const csvContent =
                "data:text/csv;charset=utf-8,Slno,Amount,Wallet Address\n1\n2\n3";
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "Bulk_Payout_Template.csv");
              document.body.appendChild(link); // Required for Firefox
              link.click();
              document.body.removeChild(link); // Cleanup
            }}
          >
            <Image
              alt="Profile"
              src={csvicon}
              className="h-5 w-5"
              priority={true}
            />
            <p className="pl-2">Download CSV Template</p>
          </MuiButton>
        </TabList>

        <TabPanels className="mt-2">
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
