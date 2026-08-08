import { useEffect, type ReactNode } from "react";
import { IcClose } from "./icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  steps?: { total: number; current: number };
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}

/** Modal — the design's centered overlay + rounded sheet with optional step dots. */
const Modal = ({ open, onClose, title, subtitle, steps, children, footer, maxWidth }: ModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`overlay${open ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" style={maxWidth ? { maxWidth } : undefined}>
        <div className="sheet-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="x" aria-label="Close" onClick={onClose}>
            <IcClose width={15} height={15} strokeWidth={2.2} />
          </button>
        </div>
        {steps && (
          <div className="steps">
            {Array.from({ length: steps.total }, (_, i) => (
              <div key={i} className={`step-dot${i < steps.current ? " on" : ""}`} />
            ))}
          </div>
        )}
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
