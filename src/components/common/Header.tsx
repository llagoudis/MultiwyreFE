import React, { useContext, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Check from "../../assets/general/check.png";
import menu from "../../assets/headericons/menu.svg";
import { SidebarContext } from "../context/SidebarProvider";
import useGlobalStore from "~/store/useGlobalStore";
import DefaultProfileYellow from "~/assets/images/defaultProfile.svg";
import { Box } from "@mui/material";
import localStorageService from "~/service/LocalstorageService";
import { useRouter } from "next/router";
import ArrowDown from "../../assets/general/arrow_down.svg";
import { Dialog } from "@headlessui/react";

interface State {
  handleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
}

interface HeaderProps {
  title: string;
}

interface SwitchAccounts {
  email: string;
  fullname: string;
  profileImgLink: string;
  token: string;
  userType: string;
}

const Topbar: React.FC<HeaderProps> = ({ title }) => {
  const { handleSidebar, setMobileOpen }: State = useContext(SidebarContext);
  const router = useRouter();

  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);

  const [openSwitchAccounts, setopenSwitchAccounts] = useState(false);
  const [swicthAccounts, setSwicthAccounts] = useState<SwitchAccounts[]>([]);
  const [activeAccount, setActiveAccount] = useState();
  const [activeName, setActiveName] = useState("Julian Sterling");
  const [activeRole, setActiveRole] = useState("Admin");

  useEffect(() => {
    const accounts = localStorageService.decodeSwitchAccounts();

    if (accounts) {
      setSwicthAccounts(accounts ?? []);
    }
    const currentUserToken = localStorageService.getLocalAccessToken();

    const currentAccount = accounts?.find((item: any) => {
      return item.token === currentUserToken?.split(" ")[1];
    });

    if (currentAccount) {
      setActiveName(currentAccount.fullname);
      setActiveRole(currentAccount.userType);
      setActiveAccount(currentAccount.token);
    }
  }, []);

  const refreshPage = () => {
    if (router.pathname === "/app/dashboard") {
      window.location.reload();
    } else {
      router.push("/app/dashboard");
    }
  };

  function changeToken(data: any) {
    localStorageService.setLocalAccessToken(data.token);

    localStorageService.updateAuthBody({
      fullname: data?.fullname,
      email: data?.email,
      profileImgLink: data?.profileImgLink,
      token: data?.token,
      countryCode: data?.countryCode,
      phone: data?.phone,
      isUserVerified: data?.isUserVerified,
      tfaEnabled: data?.tfaEnabled,
      isCompanyVerified: data?.isCompanyVerified,
      isAddressVerified: data?.isAddressVerified,
      isIdentityVerified: data?.isIdentityVerified,
      isEmailVerified: data?.isEmailVerified,
      priceList: data?.priceList,
      userType: data?.userType,
      roles: data?.roles,
      invoiceImgLink: data?.invoiceImgLink,
    });

    useGlobalStore.setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        profileImgLink: data?.profileImgLink,
        tfaEnabled: data?.tfaEnabled,
        invoiceImgLink: data?.invoiceImgLink,
      },
      setupComplete: "PENDING",
    }));

    setopenSwitchAccounts(false);
    refreshPage();
  }

  return (
    <div className="relative bg-primary-gradient sm:h-[70px] h-14 flex items-center shadow-md">
      <Dialog
        open={openSwitchAccounts}
        onClose={() => setopenSwitchAccounts(false)}
        className="absolute right-[2.5%] sm:top-[5.5rem] top-[3.5rem] z-[1000] rounded-xl bg-white text-[#1A1C1E] shadow-2xl outline-none"
      >
        <div className="min-w-[320px] max-h-[65vh] overflow-y-auto px-2 py-4">
          {swicthAccounts.map((item, i) => (
            <div
              key={i}
              className={`${item?.token === activeAccount ? "bg-gray-50 shadow-sm" : ""} rounded-lg hover:bg-gray-100 cursor-pointer transition-colors`}
              onClick={() => changeToken(item)}
            >
              <div className="flex items-center justify-between gap-6 px-4 py-3">
                <div className="flex items-center">
                  <Image
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                    src={item?.profileImgLink || DefaultProfileYellow}
                    width={40}
                    height={40}
                  />
                  <div className="ml-3">
                    <p className="font-bold text-sm">{item?.fullname}</p>
                    <p className="text-xs text-gray-500">{item?.email}</p>
                  </div>
                </div>
                {item?.token === activeAccount && (
                  <Image className="h-5 w-5" src={Check} alt="Selected" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Dialog>

      <div className="m-auto flex sm:px-5 px-3 w-full items-center justify-between">
        <div className="flex items-center sm:gap-4 gap-2">
          <div
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(true);
              } else {
                handleSidebar();
              }
            }}
            className="flex sm:h-9 h-8 sm:w-9 w-8 items-center justify-center rounded-md bg-white/20 hover:bg-white/30 cursor-pointer transition-colors"
          >
            <Image src={menu as StaticImageData} alt="Menu" className="brightness-0 invert sm:w-5 w-4 sm:h-5 h-4" />
          </div>
          <h1 className="sm:text-xl font-medium text-white">
            {title === "bulkPayout" ? "Bulk Payout" : title}
          </h1>
        </div>

        <div className="flex items-center">
          <Box
            onClick={() => setopenSwitchAccounts(true)}
            className="cursor-pointer"
          >
            <div className="flex items-center sm:gap-4 gap-2 rounded-md bg-white/15 sm:bg-[#F8F8F840] p-2 sm:pr-4 pr-2 transition-all border border-[#7E7E7E14]">
              <div className="relative  h-8 w-8">
                <Image
                  alt="Profile"
                  className="h-full w-full rounded-lg object-cover"
                  src={profileImgLink ? `${profileImgLink}` : DefaultProfileYellow}
                  width={44}
                  height={44}
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <p className="sm:text-sm text-xs font-bold text-white leading-tight">{activeName}</p>
                <p className="sm:text-[10px] text-[9px] font-medium text-white/80 leading-tight">{activeRole}</p>
              </div>
              <Image
                className="h-2 w-3 ml-2 sm:block hidden"
                style={{ filter: "brightness(0) invert(1)" }}
                src={ArrowDown}
                alt="down arrow"
              />
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
