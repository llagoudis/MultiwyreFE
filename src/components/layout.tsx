import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "./common/Sidebar";
import Header from "./common/Header";
import SidebarProvider from "./context/SidebarProvider";
import { usePathname } from "next/navigation";

type Props = {
  children: ReactNode;
  title: string;
};

const routesArray = ["/auth/login", "/auth/signup"];

const Layout = ({ children, title }: Props) => {
  const pathName = usePathname();

  return (
    <>
      <SidebarProvider>
        <div className="flex h-[100vh] bg-brand-gray">
          <div className="">
            {!routesArray.includes(pathName) && <Sidebar />}
          </div>
          <div className="w-full overflow-y-auto " >
            <div className="sticky top-0 z-50 ">
              {!routesArray.includes(pathName) && <Header title={title} />}
            </div>
            <div className="p-4">{children}</div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Layout;
