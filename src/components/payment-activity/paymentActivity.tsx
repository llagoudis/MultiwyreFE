import { Tab } from "@headlessui/react";
import React from "react";
import Deposits from "./Deposits";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PaymentActivity() {
  const Tabs = ["Deposits", "Withdrawals"];
  return (
    // <div className=" rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]">
    //   <div className=" mb-4 w-full border-b-2 border-[#cdcdcd]">
    //     <p className=" mb-4 text-base font-bold">PAYMENT ACTIVITY</p>
    //   </div>
    //   <Tab.Group>
    //     <Tab.List className="">
    //       {Tabs.map((item) => (
    //         <Tab
    //           key={item}
    //           className={({ selected }) =>
    //             classNames(
    //               " rounded-[9px] border-none px-4 py-3 text-sm text-black",

    //               selected
    //                 ? "border-b-[3px] bg-gradient-to-r from-blue-500 to-purple-700font-bold text-white outline-none"
    //                 : " font-medium text-black hover:text-black",
    //             )
    //           }
    //         >
    //           <p className="w-fit">{item}</p>
    //         </Tab>
    //       ))}
    //     </Tab.List>
    //     <Tab.Panels className="mt-4">
    //       <Tab.Panel>
    //         <Deposits />
    //       </Tab.Panel>
    //       <Tab.Panel>
    //         <Withdrawals />
    //       </Tab.Panel>
    //     </Tab.Panels>
    //   </Tab.Group>
    // </div>
    <div className="rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]">
      {/* <div className="mb-4 w-full border-b-2 border-[#cdcdcd]"> */}
        <p className="mb-4 text-base font-bold">PAYMENT ACTIVITY</p>
      {/* </div> */}
      <div className="mb-4">
        <Deposits />
      </div>
    </div>
  );
}
