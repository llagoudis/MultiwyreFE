import Modal from "~/components/mw/Modal";

type propType = {
  onClose: () => void;
  invoice?: Invoices;
  openAdd: string;
};

const InvoiceCreated = ({ onClose }: propType) => {
  return (
    <Modal
      open
      onClose={onClose}
      title="Invoice created"
      subtitle="Your invoice is ready. You can share the link from the invoices table."
      maxWidth={480}
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="done" style={{ paddingTop: 8 }}>
        <div className="ring" style={{ margin: "0 auto 16px", width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(71,117,242,.12)", color: "var(--brand-blue)" }}>
          ✓
        </div>
        <p className="mut" style={{ textAlign: "center", margin: 0 }}>
          The invoice has been created successfully.
        </p>
      </div>
    </Modal>
  );
};

export default InvoiceCreated;
