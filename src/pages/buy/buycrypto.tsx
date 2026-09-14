import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Point 3 — Stripe / buy-crypto (card) dormant — not on near-term roadmap.
 * Full buy flow retained under components/buycrypto for later restore.
 */
const BuyCrypto = () => {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/auth/login");
  }, [router]);

  return null;
};

export default BuyCrypto;
