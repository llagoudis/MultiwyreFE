import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import TransferBetweenUsers from "~/components/transfers/transfer-between-users";
import Templates from "~/components/transfers/templates";
import CryptoWithdrawal from "~/components/transfers/crypto-withdrawal";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Transfers() {
  const Tabs = ["Asset withdrawal", "Transfer between users", "Templates"];
  return (
    <div className=" ml-auto my-4 w-[95%]">
      <TabGroup>
        <TabList className="flex items-center justify-center gap-8 rounded-lg bg-white pt-2 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]">
          {Tabs.map((item) => (
            <Tab
              key={item}
              className={({ selected }) =>
                classNames(
                  " px-2 pb-5 pt-2.5 text-sm leading-5 text-black",
                  " focus:outline-none",

                  selected
                    ? "border-b-[3px] border-[#C1922E] pb-4  font-bold text-black"
                    : " font-medium text-black hover:text-black",
                )
              }
            >
              <p className=" w-fit">{item}</p>
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-2">
          <TabPanel>
            <CryptoWithdrawal />
          </TabPanel>
          <TabPanel>
            <TransferBetweenUsers />
          </TabPanel>
          <TabPanel>
            <Templates />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
