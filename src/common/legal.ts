/** Official Multiwyre legal pages (external). */
export const TERMS_AND_CONDITIONS_URL =
  "https://multiwyre.com/terms-and-conditions/";

export const isTermsAndConditionsTitle = (title?: string | null): boolean => {
  const t = (title ?? "").trim().toLowerCase();
  return (
    t === "terms and conditions" ||
    t === "terms & conditions" ||
    t === "terms of use" ||
    t === "terms of conditions"
  );
};
