import toast from "react-hot-toast";

type MwToastOpts = {
  /** Default success (dark pill). Use `error` for validation / failures. */
  type?: "success" | "error";
  duration?: number;
};

/**
 * mwToast — thin wrapper over react-hot-toast (mounted app-wide via
 * <Toaster/> in _app.tsx). Errors are red bottom-center toasts so they
 * never cover From/To dropdowns.
 */
export function mwToast(message: string, opts: MwToastOpts = {}) {
  const type = opts.type ?? "success";
  const isError = type === "error";
  const duration = opts.duration ?? (isError ? 4500 : 2600);
  const style = {
    background: isError ? "#991b1b" : "#0f172a",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    padding: "14px 20px",
    borderRadius: "12px",
    boxShadow: "0 12px 30px rgba(16,24,40,.35)",
    maxWidth: "440px",
    pointerEvents: "auto" as const,
  };

  if (isError) {
    return toast.error(message, {
      id: "mw-otc-validation",
      position: "bottom-center",
      duration,
      style,
    });
  }

  return toast.success(message, {
    id: "mw-otc-success",
    position: "bottom-center",
    duration,
    style,
  });
}

export default mwToast;
