import { useCallback, useRef, useState } from "react";

interface ConfirmState {
  open: boolean;
  message: string;
  confirmLabel: string;
}

/**
 * useConfirm — imperative confirm dialog matching the design's small centered
 * sheet (Cancel / Delete). Replaces native confirm() per the handoff.
 * Usage: const { confirm, ConfirmDialog } = useConfirm();
 *        if (await confirm('Delete "X"?')) { ... }
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, message: "", confirmLabel: "Delete" });
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((message: string, confirmLabel = "Delete") => {
    setState({ open: true, message, confirmLabel });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (v: boolean) => {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(v);
    resolver.current = null;
  };

  const ConfirmDialog = (
    <div className={`overlay${state.open ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) settle(false); }}>
      <div className="sheet" style={{ maxWidth: 380 }} role="dialog" aria-modal="true">
        <div className="sheet-body" style={{ padding: "26px 24px 6px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "14.5px", color: "var(--ink)", lineHeight: 1.55 }}>{state.message}</p>
        </div>
        <div className="sheet-foot">
          <button className="btn btn-ghost" onClick={() => settle(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => settle(true)}>{state.confirmLabel}</button>
        </div>
      </div>
    </div>
  );

  return { confirm, ConfirmDialog };
}

export default useConfirm;
