import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
import Reports from "~/components/reports/Reports";
import { useEffect, useState } from "react";
import localStorageService from "~/service/LocalstorageService";
import Ecomreports from "~/components/ecomreports/Ecomreports";

interface AuthBody {
  userType: string;
}

const ReportsPage = () => {
  const [authBody, setAuthBody] = useState<AuthBody | null>(null);
  useEffect(() => {
    const authBody = localStorageService.decodeAuthBody();
    setAuthBody(authBody);
  }, [])
  return (
    <Layout title="Reports">
      {authBody?.userType && authBody?.userType === 'PROJECT' ? (
        <Ecomreports />
      ) : (
        <Reports />
      )}
    </Layout>
  );
};

export default withAuth(ReportsPage);
