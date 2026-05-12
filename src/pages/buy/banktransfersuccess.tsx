"use client";

import { useEffect } from "react";

export default function IvySuccessPage() {
  useEffect(() => {
    // Send success message to the parent (iframe parent)
    window.parent.postMessage({ ivyEvent: "payment_succeeded" }, "*");

    // Optional: show a quick message
    // DO NOT window.close() because iframe cannot close itself
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Payment Successful</h2>
      <p>Completing your transaction...</p>
    </div>
  );
}
