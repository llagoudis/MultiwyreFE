import { useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "~/components/withAuth";

/** Bulk Payout retired — redirect to dashboard. */
const BulkPayoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/app/dashboard");
  }, [router]);

  return null;
};

export default withAuth(BulkPayoutPage);
