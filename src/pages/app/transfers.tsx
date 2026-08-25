import { useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "~/components/withAuth";

/** Transfers retired — redirect to dashboard. */
const TransferPage = () => {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/app/dashboard");
  }, [router]);

  return null;
};

export default withAuth(TransferPage);
