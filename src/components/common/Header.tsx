import React, { useContext, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Check from "../../assets/general/check.png";
import menu from "../../assets/headericons/menu.svg";
import message from "../../assets/headericons/message.svg";
import flag from "../../assets/headericons/IMAGE.svg";
import { SidebarContext } from "../context/SidebarProvider";
import useGlobalStore from "~/store/useGlobalStore";
import DefaultProfileYellow from "~/assets/images/defaultProfile.svg";
import { Box } from "@mui/material";
import localStorageService from "~/service/LocalstorageService";
import { useRouter } from "next/router";
import ArrowDown from "../../assets/general/arrow_down.svg";
import { Dialog } from "@headlessui/react";
// import DefaultProfile from "~/assets/images/defaultProfileImage.png";
// import Link from "next/link";
// import { login } from "~/service/ApiRequests";
// import { decryptResponse } from "~/helpers/helper";
interface State {
  handleSidebar: () => void;
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
  const { handleSidebar }: State = useContext(SidebarContext);
  const router = useRouter();

  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);

  const [openSwitchAccounts, setopenSwitchAccounts] = useState(false);
  const [swicthAccounts, setSwicthAccounts] = useState<SwitchAccounts[]>([]);
  const [activeAccount, setActiveAccount] = useState();
  const [activeName, setActiveName] = useState();
  // console.log("activeAccount", activeAccount);

  useEffect(() => {
    const accounts = localStorageService.decodeSwitchAccounts();

    if (accounts) {
      setSwicthAccounts(accounts ?? []);
    }
    const currentUserToken = localStorageService.getLocalAccessToken();

    const currentAccount = accounts?.find((item: any) => {
      return item.token === currentUserToken?.split(" ")[1];
    });

    setActiveName(currentAccount?.fullname);

    setActiveAccount(currentAccount?.token);
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
    <div
      style={{
        boxShadow: "1.1802083253860474px 0px 5.901041507720947px 0px #0000000D",
      }}
      className=" relative "
    >
      <Dialog
        open={openSwitchAccounts}
        onClose={() => {
          setopenSwitchAccounts(false);
        }}
        className="absolute right-[3.3%] top-[5.5rem] z-[999] rounded-lg bg-gradient-to-r from-blue-500 to-purple-700 text-white shadow-[0px_1px_8px_0px_rgba(0,0,0,0.25)] outline-none"
      >
        <div className=" min-w-[360px]: max-h-[65vh] overflow-y-auto px-2  py-4">
          {swicthAccounts.map((item, i) => (
            <div
              key={i}
              className={`${
                item?.token === activeAccount
                  ? "relative bg-white/50 shadow-md hover:bg-transparent"
                  : " relative"
              } rounded-lg hover:bg-slate-100`}
              onClick={() => {
                void changeToken(item);
              }}
            >
              <div className="flex cursor-pointer items-center justify-between gap-8 px-6 py-3 ">
                <div className=" flex items-center">
                  <div>
                    <Image
                      alt="ProfileTest"
                      className="h-11 w-11 rounded-full object-cover"
                      src={
                        item?.profileImgLink
                          ? item?.profileImgLink
                          : DefaultProfileYellow
                      }
                      width={42}
                      height={42}
                    ></Image>
                  </div>

                  <div className=" ml-4">
                    <p className="font-bold"> {item?.fullname}</p>
                    <p>{item?.email}</p>
                  </div>
                </div>

                <p className="absolute right-2 top-2 text-xs font-semibold">
                  {item?.userType}
                </p>

                {item?.token === activeAccount ? (
                  <Image className=" h-5 w-5" src={Check} alt="Selected" />
                ) : (
                  ""
                )}
              </div>
              {/* {isUserInAccount(item.token) && (
                <div className="text-green-500"> &#10003; </div>
              )} */}
            </div>
          ))}
        </div>
      </Dialog>
      <div
        className={` z-[9999] m-auto flex h-20 w-[95%] items-center justify-between`}
      >
        <div className="flex items-center gap-8">
          <Image
            src={menu as StaticImageData}
            alt=""
            className="cursor-pointer brightness-[10]"
            onClick={handleSidebar}
          />
          <h1 className="px-1 text-sm text-white md:text-lg">
            {title === "bulkPayout" ? "Bulk Payout" : title}
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <Image className=" hidden" alt="" src={message as StaticImageData} />
          <div className="hidden items-center gap-1">
            <Image alt="" src={flag as StaticImageData} />
            <p>English</p>
          </div>
          <Box
            onClick={() => {
              setopenSwitchAccounts(true);
            }}
          >
            <div className="flex items-center gap-2 rounded-[44px] bg-transparent px-4 py-2">
              <p className=" text-white">{activeName}</p>
              <Image
                alt="Profile"
                className="h-[42px] w-[42px] cursor-pointer rounded-full object-cover"
                src={
                  profileImgLink
                    ? `${profileImgLink}?t=${new Date().getTime()}`
                    : DefaultProfileYellow
                }
                width="42"
                height="42"
              />
              <Image
                className=" h-2 w-3"
                style={{ filter: "brightness(10)" }}
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
