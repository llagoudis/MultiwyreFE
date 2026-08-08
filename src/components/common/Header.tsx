import React, { useContext, useEffect, useState } from "react";
import { SidebarContext } from "../context/SidebarProvider";
import useGlobalStore from "~/store/useGlobalStore";
import localStorageService from "~/service/LocalstorageService";
import { useRouter } from "next/router";
import { Dialog } from "@headlessui/react";
import { goToDashboard } from "~/helpers/navigationHelper";

interface HeaderProps {
  title: string;
  crumb?: string;
}

interface SwitchAccounts {
  email: string;
  fullname: string;
  profileImgLink: string;
  token: string;
  userType: string;
}

const CRUMB: Record<string, string> = {
  Dashboard: "Overview of your accounts",
  "OTC Exchange": "Exchange at best market price",
  Exchange: "Exchange at best market price",
  Invoice: "Create and track payment requests",
  Invoices: "Create and track payment requests",
  History: "Your transaction and trading activity",
  Profile: "Account settings and fees",
};

const DEFAULT_AVATAR = "/mw/headericons/profile-img.png";

const Topbar: React.FC<HeaderProps> = ({ title, crumb }) => {
  const { handleSidebar, setMobileOpen } = useContext(SidebarContext);
  const router = useRouter();

  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);

  const [openSwitchAccounts, setOpenSwitchAccounts] = useState(false);
  const [switchAccounts, setSwitchAccounts] = useState<SwitchAccounts[]>([]);
  const [activeAccount, setActiveAccount] = useState<string>();
  const [activeName, setActiveName] = useState("");
  const [activeRole, setActiveRole] = useState("");

  useEffect(() => {
    const accounts = localStorageService.decodeSwitchAccounts();
    if (accounts) setSwitchAccounts(accounts ?? []);

    const currentUserToken = localStorageService.getLocalAccessToken();
    const currentAccount = accounts?.find(
      (item: SwitchAccounts) => item.token === currentUserToken?.split(" ")[1],
    );

    const authBody = localStorageService.decodeAuthBody();
    setActiveName(currentAccount?.fullname ?? authBody?.fullname ?? "");
    setActiveRole(currentAccount?.userType ?? authBody?.userType ?? authBody?.roles ?? "");
    if (currentAccount) setActiveAccount(currentAccount.token);
  }, []);

  const refreshPage = () => {
    if (router.pathname === "/app/dashboard") window.location.reload();
    else goToDashboard("HEADER");
  };

  function changeToken(data: SwitchAccounts) {
    localStorageService.setLocalAccessToken(data.token);
    localStorageService.updateAuthBody({
      fullname: data?.fullname,
      email: data?.email,
      profileImgLink: data?.profileImgLink,
      token: data?.token,
      userType: data?.userType,
    });
    useGlobalStore.setState((prev) => ({
      ...prev,
      user: { ...prev.user, profileImgLink: data?.profileImgLink },
      setupComplete: "PENDING",
    }));
    setOpenSwitchAccounts(false);
    refreshPage();
  }

  const resolvedCrumb = crumb ?? CRUMB[title] ?? "";

  return (
    <header className="top">
      <button
        className="icon-btn"
        aria-label="Menu"
        onClick={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) setMobileOpen(true);
          else handleSidebar();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div>
        <h1>{title}</h1>
        {resolvedCrumb && <div className="crumb">{resolvedCrumb}</div>}
      </div>

      <div className="spacer" />

      <div className="user" onClick={() => switchAccounts.length > 0 && setOpenSwitchAccounts(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="avatar" src={profileImgLink || DEFAULT_AVATAR} alt="" onError={(e) => ((e.target as HTMLImageElement).src = DEFAULT_AVATAR)} />
        <div>
          <div className="nm">{activeName || "Account"}</div>
          {activeRole && <div className="rl">{String(activeRole).toUpperCase()}</div>}
        </div>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <Dialog
        open={openSwitchAccounts}
        onClose={() => setOpenSwitchAccounts(false)}
        className="fixed right-[2%] top-[72px] z-[1000] rounded-xl bg-white text-[#1A1C1E] shadow-2xl outline-none"
      >
        <div className="min-w-[320px] max-h-[65vh] overflow-y-auto px-2 py-3">
          {switchAccounts.map((item, i) => (
            <div
              key={i}
              className={`${item?.token === activeAccount ? "bg-gray-50" : ""} rounded-lg hover:bg-gray-100 cursor-pointer transition-colors`}
              onClick={() => changeToken(item)}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="h-9 w-9 rounded-full object-cover" src={item?.profileImgLink || DEFAULT_AVATAR} />
                <div>
                  <p className="text-sm font-bold">{item?.fullname}</p>
                  <p className="text-xs text-gray-500">{item?.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </header>
  );
};

export default Topbar;
