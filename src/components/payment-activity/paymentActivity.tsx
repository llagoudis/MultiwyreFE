import { Tab } from "@headlessui/react";
import React from "react";
import Deposits from "./Deposits";
import Withdrawals from "./Withdrawals";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PaymentActivity() {
  const tabs = ["Deposits", "Withdrawals"];

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
      <p className="mb-6 text-xl font-bold text-[#1A1C1E]">Payment Activity</p>

      <Tab.Group>
        <Tab.List className="flex space-x-2 rounded-md bg-[#EEF1FF] p-2 w-fit mb-8">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  "w-32 rounded-md py-3 text-sm font-bold leading-5 transition-all duration-200",
                  "ring-white ring-opacity-60 ring-offset-2 focus:outline-none",
                  selected
                    ? "bg-primary-gradient text-white shadow"
                    : "text-[#ccc] hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <Deposits />
          </Tab.Panel>
          <Tab.Panel>
            <Withdrawals />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
