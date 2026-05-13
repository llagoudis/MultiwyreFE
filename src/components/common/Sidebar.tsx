import { Fragment, useEffect, useState, useContext } from "react";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/router";
import logo from "../../assets/images/new-log.png";
import { SidebarContext } from "../context/SidebarProvider";
import {
  DashboardTabIcon,
  ExcahngeTabIcon,
  TransferTabIcon,
  InvoiceTabIcon,
  HistoryTabIcon,
  ProfileTabIcon
} from "~/assets/svgs";

const Sidebar = () => {
  const { open } = useContext(SidebarContext);
  const router = useRouter();
  const [pathName, setPathName] = useState("");

  useEffect(() => {
    setPathName(router.pathname);
  }, [router.pathname]);

  const handleNavigate = (path: string) => {
    void router.push(path);
  };

  const routes = [
    {
      name: "Dashboard",
      path: "/app/dashboard",
      icon: DashboardTabIcon,
    },
    {
      name: "Exchange",
      path: "/app/exchange",
      icon: ExcahngeTabIcon,
    },
    {
      name: "Transfers",
      path: "/app/transfers",
      icon: TransferTabIcon,
    },
    {
      name: "Invoice",
      path: "/app/invoice",
      icon: InvoiceTabIcon,
    },
    {
      name: "History",
      path: "/app/history",
      icon: HistoryTabIcon,
    },
    {
      name: "Bulk Payout",
      path: "/app/bulk-payout",
      icon: HistoryTabIcon,
    },
    {
      name: "Profile",
      path: "/app/profile",
      icon: ProfileTabIcon,
    },
  ];

  const isActive = (path: string) => pathName === path;

  // open = true means collapsed in your original logic
  const isCollapsed = open;

  return (
    <Fragment>
      {/* Desktop */}
      <nav className={`${!isCollapsed ? "w-64" : "w-[80px]"} hidden h-screen bg-white transition-all duration-300 md:flex flex-col`}>
        <div className="logo relative flex h-20 items-center justify-center bg-[#4775F2] text-white overflow-hidden">
          <Image
            alt="Logo"
            className={`transition-all duration-300 ${!isCollapsed ? "w-36" : "w-10"} h-auto object-cover`}
            src={logo}
            width={150}
            height={32}
            priority
          />
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4 pt-10 capitalize overflow-y-auto overflow-x-hidden">
          {routes.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <div
                key={i}
                onClick={() => handleNavigate(item.path)}
                className={`group flex cursor-pointer items-center transition-all duration-300 ${isCollapsed ? "justify-center p-3" : "gap-4 p-3"} rounded-lg ${active
                  ? "bg-primary-gradient text-white shadow-md"
                  : "text-[#606060] hover:bg-gray-50 hover:text-[#1A1C1E]"
                  }`}
              >
                <div className="flex-shrink-0">
                  <Icon className={`${active ? "text-white" : "text-[#606060] group-hover:text-[#1A1C1E]"} transition-colors`} />
                </div>
                {!isCollapsed && (
                  <span className={` font-semibold whitespace-nowrap transition-opacity duration-300 ${active ? "text-white" : "text-[#606060] group-hover:text-[#1A1C1E]"}`}>
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-gray-50">
          <div
            onClick={() => handleNavigate("/auth/login")}
            className={`group flex cursor-pointer items-center transition-all duration-300 ${isCollapsed ? "justify-center p-3" : "gap-4 p-3"} rounded-lg text-[#606060] hover:bg-gray-50 hover:text-[#1A1C1E]`}
          >
            <div className="flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#606060] group-hover:text-[#1A1C1E]">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="text-sm font-semibold whitespace-nowrap">Logout</span>
            )}
          </div>
        </div>
      </nav>
    </Fragment>
  );
};

export default Sidebar;
