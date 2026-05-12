"use client";

import { useEffect } from "react";

export default function IvyFailedPage() {
  useEffect(() => {
    window.parent.postMessage({ ivyEvent: "payment_failed" }, "*");
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Payment failed</h2>
      <p>Returning to app...</p>
    </div>
  );
}
