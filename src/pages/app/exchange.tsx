// import Layout from "~/components/layout";
// import withAuth from "~/components/withAuth";
// import ExchangeNew from "~/components/exchange/ExhangeNew";

// const ExchangePage = () => {
//   return <Layout title="Exchange">{<ExchangeNew />}</Layout>;
// };

// export default withAuth(ExchangePage);

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
// import Exchange from "~/components/exchange/Exchange";
// import useGlobalStore from "~/store/useGlobalStore";
import { checkUserStatus } from "~/service/api/accounts";
import ExchangeNew from "~/components/exchange/ExchangeNew";
import {goToDashboard} from "~/helpers/navigationHelper";

const ExchangePage = () => {
  const router = useRouter();

  const [status, setStatus] = useState(false);

  const checkStatus = async () => {
    const [response, error] = await checkUserStatus();

    if (response?.success) {
      setStatus(response?.success);
    } else {
      goToDashboard('EXCHANGE');
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  return <Layout title="Exchange">{status && <ExchangeNew />}</Layout>;
};

export default withAuth(ExchangePage);
