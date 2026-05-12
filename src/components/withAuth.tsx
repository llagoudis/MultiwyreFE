import { redirect } from "next/navigation";
import { useEffect } from "react";
import localStorageService from "~/service/LocalstorageService";

const withAuth = (Component: any): any => {
  const PrivateRoute = ({ props }: any) => {
    useEffect(() => {
      const token = localStorageService.getLocalAccessToken();
      if (!token) {
        try {
          return redirect("/auth/login");
        } catch (err) {}
      }
    }, []);

    return <Component {...props} />;
  };

  return PrivateRoute;
};

export default withAuth;
