import { type ReactNode } from "react";
import Sidebar from "./common/Sidebar";
import Header from "./common/Header";
import SidebarProvider from "./context/SidebarProvider";
import { usePathname } from "next/navigation";

type Props = {
  children: ReactNode;
  title: string;
  crumb?: string;
};

const bareRoutes = ["/auth/login", "/auth/signup"];

const Layout = ({ children, title, crumb }: Props) => {
  const pathName = usePathname();
  const bare = bareRoutes.includes(pathName ?? "");

  if (bare) return <>{children}</>;

  return (
    <SidebarProvider>
      <div className="mw-root">
        <div className="app">
          <Sidebar />
          <div className="main">
            <Header title={title} crumb={crumb} />
            <main className="content">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
