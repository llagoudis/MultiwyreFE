import React, {
  createContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import localStorageService from "~/service/LocalstorageService";

type Props = {
  children: ReactNode;
};

type SidebarContextType = {
  open: boolean;
  handleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  profileImgLink: string;
  setProfileImgLink: (link: string) => void;
};

export const SidebarContext = createContext<SidebarContextType>({
  open: false,
  handleSidebar: () => {
    /**/
  },
  mobileOpen: false,
  setMobileOpen: () => {},
  profileImgLink: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setProfileImgLink: () => {},
});

const SidebarProvider = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [profileImgLink, setProfileImgLink] = useState<string>("");
  const handleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const userDetails = localStorageService.decodeAuthBody();
    if (userDetails) {
      setProfileImgLink(userDetails.profileImgLink ?? "");
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{ handleSidebar, open, mobileOpen, setMobileOpen, setProfileImgLink, profileImgLink }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
