import { useEffect, useState } from "react";
import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";

import Transfers from "~/components/transfers/Transfers";
import { checkUserStatus } from "~/service/api/accounts";
import { useRouter } from "next/router";
import {goToDashboard} from "~/helpers/navigationHelper";

const TransferPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState(false);

  const checkStatus = async () => {
    const [response, error] = await checkUserStatus();

    if (response?.success) {
      setStatus(response?.success);
    } else {
      goToDashboard('TRANSFER')
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  return <Layout title="Transfers">{status && <Transfers />}</Layout>;
};

export default withAuth(TransferPage);
