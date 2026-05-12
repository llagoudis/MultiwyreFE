import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";
import logout from "~/assets/general/logout.svg";
import { logout as LogoutUser } from "~/helpers/helper";
import { checkUserStatus } from "~/service/api/accounts";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import bulkupload from "../../assets/navicons/bulkupload.svg";
import exchange from "../../assets/navicons/exchange.svg";
import home from "../../assets/navicons/home.svg";
import invoices from "../../assets/navicons/invoice.svg";
import profile from "../../assets/navicons/profile.svg";
import reports from "../../assets/navicons/report.svg";
import transfers from "../../assets/navicons/transfers.svg";
import { SidebarContext } from "../context/SidebarProvider";

interface Route {
  name: string;
  path: string;
  icon: string; // Assuming your icon is a string path to the image
}

interface State {
  open: boolean;
  handleSidebar: () => void;
}

const Sidebar: React.FC = () => {
  const pathName = usePathname();
  const router = useRouter();

  const { open, handleSidebar }: State = useContext(SidebarContext);

  const admin = useGlobalStore((state) => state.admin);

  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);
  const handleNavigate = async (path: any) => {
    try {
      if (path === "/app/exchange" || path === "/app/transfers") {
        const [response, error] = await checkUserStatus();

        if (response?.success) {
          router.push(path);
        }
      } else {
        router.push(path);
      }
    } catch (error) {}
  };

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authBody = localStorageService.decodeAuthBody();

    const userType = authBody?.userType;
    const allStaffsCheck = authBody?.allStaffs || [];
    const viewerRole = authBody?.roles;

    let updatedRoutes: Route[] = [
      { name: "dashboard", path: "/app/dashboard", icon: home },
      { name: "exchange", path: "/app/exchange", icon: exchange },
      { name: "transfers", path: "/app/transfers", icon: transfers },
      { name: "History", path: "/app/history", icon: reports },
      { name: "profile", path: "/app/profile", icon: profile },
    ];

    if (viewerRole === "ex_user_viewer") {
      updatedRoutes = updatedRoutes.filter(
        (route) => route.name === "Reports" || route.name === "dashboard",
      );

      if (userType === "PROJECT" || userType === "COMPANY") {
        updatedRoutes.push({
          name: "invoices",
          path: "/app/invoices",
          icon: invoices,
        });
      }
    } else {
      if (userType === "PROJECT") {
        updatedRoutes = updatedRoutes.filter(
          (route) => route.name !== "exchange",
        );
      }

      if (
        Array.isArray(allStaffsCheck) &&
        allStaffsCheck.every(
          (user) =>
            Array.isArray(user.projectUsers) && user.projectUsers.length > 0,
        )
      ) {
        if (userType === "PROJECT" || userType === "COMPANY") {
          updatedRoutes.splice(2, 0, {
            name: "invoices",
            path: "/app/invoices",
            icon: invoices,
          });

          if (userType === "PROJECT") {
            updatedRoutes.push({
              name: "Bulk Payout",
              path: "/app/bulkPayout",
              icon: bulkupload,
            });
          }
        }
      }
    }

    setRoutes(updatedRoutes);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Replace with a skeleton loader if needed
  }

  return (
    <>
      {/* Desktop */}
      <nav
        className={`${
          !open ? "w-full md:w-48 " : "w-[70px]"
        }   hidden h-screen duration-500 md:block`}
      >
        <div className="logo relative flex h-20 items-center justify-center bg-gradient-to-r from-blue-500 to-blue-500 text-white">
          {admin?.profileImgLink && (
            <div className="logo relative flex items-center justify-center py-2  ">
              <Image
                alt={"Profile"}
                className="h-auto w-[100px] object-cover"
                src={admin?.profileImgLink || profileImgLink}
                width={"150"}
                height={"100"}
                priority={true}
              />
            </div>
          )}
        </div>

        <div className=" flex  flex-col gap-8 pl-6 pt-12 capitalize">
          {routes.map((item: any, i: any) => {
            return (
              <div
                key={i}
                onClick={() => {
                  handleNavigate(item.path);
                }}
                className="group flex cursor-pointer items-center gap-4 p-2 rounded-[10px] transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-700 hover:text-white"
              >
                <Image
                  alt=""
                  src={item.icon as StaticImageData}
                  className={` brightness-[0]  ${
                    pathName === item.path && "brightness-[1]"
                  }`}
                />

                <h1
                  style={
                    {
                      // transitionDelay: `${i + 3}00ms`,
                    }
                  }
                  className={`font-semibold group-hover:text-white ${
                    pathName === item.path && "text-[#C3922E]"
                  }  ${open && "pointer-events-none opacity-0"}`}
                >
                  {item?.name}
                </h1>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-6 mt-5 flex flex-col justify-center gap-9 pl-6 capitalize">
          <button
            className="group flex cursor-pointer items-center gap-3"
            onClick={LogoutUser}
          >
            <Image
              alt=""
              src={logout as StaticImageData}
              className={`brightness-0 group-hover:brightness-100`}
            />
            <h1
              className={`font-semibold text-black group-hover:text-white ${
                open && "opacity-0 "
              }`}
            >
              Logout
            </h1>
          </button>
        </div>
      </nav>
      {/* Mobile */}
      <nav
        className={`fixed h-full  w-1/2 bg-black lg:w-[35vw] ${
          open ? "left-0" : "-left-full"
        } top-0 z-50 block p-1 duration-500 md:hidden`}
      >
        <div className="logo relative flex h-[15vh] justify-end p-5 text-white">
          <RiCloseCircleLine
            onClick={handleSidebar}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
        <div className="logo relative flex h-[10vh] items-center justify-center text-white">
          {admin?.profileImgLink && (
            <Image
              alt={"Profile"}
              className="h-auto w-[100px] object-cover"
              src={admin?.profileImgLink || profileImgLink}
              width={"150"}
              height={"100"}
              priority={true}
            />
          )}
        </div>

        <div className=" flex flex-col justify-center gap-7 pl-6 capitalize">
          {routes.map((item: any, i: any) => (
            <div
              key={i}
              // href={item.path}
              onClick={() => {
                handleNavigate(item.path);
              }}
              className="group flex cursor-pointer items-center gap-4 "
            >
              <Image
                alt=""
                src={item.icon as StaticImageData}
                className={`group-hover:brightness-200  ${
                  pathName === item.path && "brightness-200"
                }`}
              />
              <h1
                style={
                  {
                    // transitionDelay: `${i + 3}00ms`,
                  }
                }
                className={`text-[#8B8D91] group-hover:text-white ${
                  pathName === item.path && "text-white"
                }  ${!open && "pointer-events-none opacity-0"}`}
              >
                {item?.name}
              </h1>
            </div>
          ))}
        </div>
        <div className="absolute bottom-6 mt-5 flex flex-col justify-center gap-7 pl-6 capitalize">
          <button
            className="group flex cursor-pointer items-center gap-3"
            onClick={LogoutUser}
          >
            <Image
              alt=""
              src={logout as StaticImageData}
              className={`group-hover:brightness-200`}
            />
            <h1
              className={`text-[#8B8D91] group-hover:text-white ${
                !open && "opacity-0 "
              }`}
            >
              Logout
            </h1>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
