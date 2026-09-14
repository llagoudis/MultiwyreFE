import { useEffect } from "react";
import { useRouter } from "next/router";

/** Point 4 — Ivy / open-banking bank-transfer success dormant (not on near-term roadmap). */
export default function IvySuccessPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/auth/login");
  }, [router]);

  return null;
}
