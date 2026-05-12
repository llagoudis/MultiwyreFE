import { useEffect, useState } from "react";
import Ecomreports from "~/components/ecomreports/Ecomreports";
import Layout from "~/components/layout";
import Reports from "~/components/reports/Reports";
import withAuth from "~/components/withAuth";
import localStorageService from "~/service/LocalstorageService";

interface AuthBody {
  userType: string;
}

const ReportsPage = () => {
  const [authBody, setAuthBody] = useState<AuthBody | null>(null);
  useEffect(() => {
    const authBody = localStorageService.decodeAuthBody();
    setAuthBody(authBody);
  }, []);
  return (
    <Layout title="History">
      {authBody?.userType && authBody?.userType === "PROJECT" ? (
        <Ecomreports />
      ) : (
        <Reports />
      )}
    </Layout>
  );
};

export default withAuth(ReportsPage);
