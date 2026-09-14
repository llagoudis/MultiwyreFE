import Router from "next/router";

export function goToDashboard(reason?: string) {
  console.log("Redirecting to dashboard:", reason);
  console.log("Current path:", window.location.pathname);
  console.trace();

   const unprotectedRoutes = [
      "/",
      // Point 3 — Stripe /buy dormant (not on near-term roadmap)
      // "/buy/buycrypto",
      // "/buy/success",
      "/auth/signup",
      "/auth/login",
      /^\/ecompayment\/[^/]+$/,
      /^\/invoices\/[^/]+$/,
      "EcomInvoicePayTwo",
      "EcomInvoiceScannerTwo",
      "InvoicePay",
      "InvoiceScanner",
    ];

    const isUnprotected = unprotectedRoutes.some((route) => {
      if (typeof route === "string") {
        return route === window.location.pathname;
      } else if (route instanceof RegExp) {
        return route.test(window.location.pathname);
      }
      return false;
    });

    if ( isUnprotected) {
      Router.push("/app/dashboard");
    }
}
