import toast from "react-hot-toast";

/**
 * mwToast — thin wrapper over react-hot-toast (already mounted app-wide via
 * <Toaster/> in _app.tsx) styled to match the design's bottom-center dark pill.
 * Reuses the existing toast library rather than the prototype's bespoke one.
 */
export function mwToast(message: string) {
  return toast(message, {
    position: "bottom-center",
    duration: 2600,
    style: {
      background: "#0f172a",
      color: "#fff",
      fontSize: "13.5px",
      fontWeight: 500,
      padding: "12px 18px",
      borderRadius: "12px",
      boxShadow: "0 12px 30px rgba(16,24,40,.28)",
    },
    icon: "✓",
  });
}

export default mwToast;
