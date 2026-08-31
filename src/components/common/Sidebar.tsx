import { Fragment, useContext } from "react";
import { useRouter } from "next/router";
import { logout } from "~/helpers/helper";
import { SidebarContext } from "../context/SidebarProvider";

/**
 * Sidebar — Non-Custodial redesign.
 * Matches the design handoff: white sidebar, gradient brand header, gradient
 * active pill, image-based nav icons (public/mw/navicons/*).
 * Transfers & Bulk Payout removed from product (routes redirect to dashboard).
 */
const NAV = [
  { name: "Dashboard", path: "/app/dashboard", icon: "/mw/navicons/home.svg" },
  { name: "OTC Exchange", path: "/app/exchange", icon: "/mw/navicons/exchange.svg" },
  { name: "Invoice", path: "/app/invoices", icon: "/mw/navicons/report.svg" },
  { name: "History", path: "/app/history", icon: "/mw/navicons/Union.svg" },
  { name: "Profile", path: "/app/profile", icon: "/mw/navicons/profile.svg" },
];

const Sidebar = () => {
  const { mobileOpen, setMobileOpen } = useContext(SidebarContext);
  const router = useRouter();

  const go = (path: string) => {
    void router.push(path);
    if (mobileOpen) setMobileOpen(false);
  };

  const isActive = (path: string) =>
    router.pathname === path || router.pathname.startsWith(path + "/");

  const Content = () => (
    <>
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mw/images/multiwyre-logo-white.png" alt="Multiwyre" />
      </div>
      <nav className="nav">
        {NAV.map((item) => (
          <div
            key={item.path}
            className={`nav-item${isActive(item.path) ? " active" : ""}`}
            onClick={() => go(item.path)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.icon} alt="" />
            {item.name}
          </div>
        ))}
      </nav>
      <div className="nav-foot">
        <div
          className="nav-item"
          onClick={() => {
            if (mobileOpen) setMobileOpen(false);
            void logout();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mw/sidebaricons/logout.svg" alt="" />
          Logout
        </div>
      </div>
    </>
  );

  return (
    <Fragment>
      {/* Desktop sidebar */}
      <aside className="side">
        <Content />
      </aside>

      {/* Mobile drawer */}
      <div className={`overlay${mobileOpen ? " open" : ""}`} style={{ zIndex: 120 }} onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}>
        <aside
          className="side"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            height: "100vh",
            transform: mobileOpen ? "none" : "translateX(-100%)",
            transition: "transform .25s ease",
          }}
        >
          <Content />
        </aside>
      </div>
    </Fragment>
  );
};

export default Sidebar;
