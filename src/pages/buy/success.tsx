import { useEffect } from "react";
import { useRouter } from "next/router";

/** Point 3 — Stripe buy-crypto success dormant (not on near-term roadmap). */
const Success = () => {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/auth/login");
  }, [router]);

  return null;
};

export default Success;
