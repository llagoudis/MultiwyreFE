import {Tab, TabGroup, TabList, TabPanel, TabPanels} from "@headlessui/react";
import Templates from "~/components/transfers/templates";
import CryptoWithdrawal from "~/components/transfers/crypto-withdrawal";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import localStorageService from "../../service/LocalstorageService";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Transfers() {
  const tabs = ["Transfer", "Whitelist Addresses"];
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<any>({
    tfaEnabled: "",
  });
  const [otpValidated, setOtpValidated] = useState<boolean>(false);

  const {tfaEnabled} = userDetails || {};

  useEffect(() => {
    const data = localStorageService.decodeAuthBody();
    setUserDetails(data);
  }, []);

  const handleNavigate = (path: string) => {
    void router.push(path);
  }

  return (
    <div className="w-full mx-auto ">
      <TabGroup>
        <div className="flex justify-start mb-4 rounded-lg bg-white w-full">
          <TabList className="flex items-center px-3  lg:w-[60%] w-full p-1.5 rounded-xl ">
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className={({selected}) =>
                  classNames(
                    "flex-1 px-8 py-3 text-sm font-bold rounded-lg transition-all duration-300 outline-none",
                    selected
                      ? "bg-primary-gradient text-white shadow-md scale-[1.02]"
                      : "text-[#8B8D91] hover:text-[#1A1C1E] hover:bg-gray-50"
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </TabList>
        </div>
        {console.log(tfaEnabled)}
        {/* 2FA Alert */}
       {
         !tfaEnabled && !otpValidated && (
          <div className="mb-0 flex items-center justify-between bg-[#FFF8F9] border border-[#FFD0DA] rounded-md px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#FF3D71] text-[#FF3D71]">
                <span className="font-bold">!</span>
              </div>
              <p className="text-[#1A1C1E] font-medium text-sm">
                Please enable two factor authentication to secure your account.
              </p>
            </div>

            <button
              onClick={() => handleNavigate("/app/profile")}
              className="text-[#4775F2] text-sm whitespace-nowrap font-bold hover:underline"
            >
              Enable Now
            </button>
          </div>
        )}

        <TabPanels>
          <TabPanel className="focus:outline-none">
            <CryptoWithdrawal/>
          </TabPanel>
          <TabPanel className="focus:outline-none">
            <Templates/>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
