import { useEffect, useState } from "react";
import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
import { checkUserStatus } from "~/service/api/accounts";
import ExchangeNew from "~/components/exchange/ExchangeNew";
import { goToDashboard } from "~/helpers/navigationHelper";

const ExchangePage = () => {
  const [status, setStatus] = useState(false);

  const checkStatus = async () => {
    const [response, error] = await checkUserStatus();

    if (response?.success) {
      setStatus(response?.success);
    } else {
      goToDashboard("EXCHANGE");
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  return <Layout title="OTC Exchange">{status && <ExchangeNew />}</Layout>;
};

export default withAuth(ExchangePage);
