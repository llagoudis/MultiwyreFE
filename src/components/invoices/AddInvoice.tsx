import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "~/components/mw/Modal";
import mwToast from "~/components/mw/toast";
import { createInvoices } from "~/service/ApiRequests";
import { getAllCustomerMerchants } from "~/service/api/accounts";
import { ApiHandler } from "~/service/UtilService";

type propType = {
  onClose: (value?: string) => void;
  invoice?: Invoices;
  openAdd: string;
  setInvoiceUpdated: React.Dispatch<React.SetStateAction<boolean>>;
};

type BillingItem = {
  id: number;
  description: string;
  amount: string;
};

type InvoiceForm = {
  name: string;
  billingAddress: string;
  currency: string;
  amount: string;
  email?: string;
  projectId: string;
};

const currencyList = [
  {
    fireblockAssetId: "EUR",
    name: "Euro",
    symbol: "€",
  },
  {
    fireblockAssetId: "USD",
    name: "USD",
    symbol: "$",
  },
];

const AddInvoice = ({ onClose, invoice, openAdd }: propType) => {
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
  } = useForm<InvoiceForm>({
    defaultValues: {
      name: "",
      billingAddress: "",
      currency: "",
      amount: "0",
      email: "",
      projectId: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([
    { id: Date.now(), description: "", amount: "" },
  ]);
  const [nextId, setNextId] = useState(Date.now() + 1);

  const currencyWatch = watch("currency");
  const totalAmount = billingItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const currencyData =
    currencyList.find((c) => c.fireblockAssetId === currencyWatch) ?? {
      symbol: "$",
      fireblockAssetId: "",
      name: "",
    };

  useEffect(() => {
    void (async () => {
      const [response] = await getAllCustomerMerchants();
      if (response?.body) {
        setMerchants(response.body);
        if (response.body.length === 1) {
          setValue("projectId", response.body[0]?.projectId ?? "");
        }
      }
    })();
  }, [setValue]);

  useEffect(() => {
    setValue("amount", totalAmount.toString());
  }, [totalAmount, setValue]);

  useEffect(() => {
    if (invoice) reset({ ...invoice });
  }, [invoice, reset]);

  const addBillingItem = () => {
    setBillingItems((prev) => [
      ...prev,
      { id: nextId, description: "", amount: "" },
    ]);
    setNextId((n) => n + 1);
  };

  const removeBillingItem = (idToRemove: number) => {
    setBillingItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const onSubmit = async (values: InvoiceForm) => {
    if (!values.name?.trim()) return mwToast("Bill to is required");
    if (!values.billingAddress?.trim()) return mwToast("Billing address is required");
    if (!values.projectId) return mwToast("Project is required");
    if (!values.currency) return mwToast("Currency is required");
    if (totalAmount <= 0) return mwToast("Add at least one billing amount");

    setLoading(true);
    const payload = {
      name: values.name,
      billingItems: billingItems.map(({ description, amount }) => ({
        description,
        amount,
      })),
      billingAddress: values.billingAddress,
      currency: values.currency,
      amount: totalAmount,
      email: values.email || null,
      projectId: values.projectId,
    };
    const [res]: APIResult<any> = await ApiHandler(createInvoices, payload);
    setLoading(false);
    if (res?.success) onClose("success");
    else mwToast("Failed to create invoice");
  };

  return (
    <Modal
      open={Boolean(openAdd)}
      onClose={() => onClose()}
      title="New invoice"
      subtitle="Enter invoice details"
      maxWidth={640}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={() => onClose()} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => void handleSubmit(onSubmit)()}
          >
            {loading ? "Creating…" : "Create invoice"}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(onSubmit)();
        }}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="fld">
            <label htmlFor="invName">Bill to</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <input {...field} id="invName" className="inp" placeholder="Customer / company name" />
              )}
            />
          </div>
          <div className="fld">
            <label htmlFor="invAddr">Billing address</label>
            <Controller
              name="billingAddress"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <input {...field} id="invAddr" className="inp" placeholder="Billing address" />
              )}
            />
          </div>
        </div>

        <div className="fld">
          <label htmlFor="invEmail">Email (optional)</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input {...field} id="invEmail" className="inp" type="email" placeholder="customer@email.com" />
            )}
          />
        </div>

        <div className="fld">
          <label htmlFor="invProject">Project</label>
          <Controller
            name="projectId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <select
                {...field}
                id="invProject"
                className="inp"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select project</option>
                {merchants.map((m) => (
                  <option key={m.projectId} value={m.projectId}>
                    {m.projectName}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        <div className="fld">
          <label>Currency</label>
          <div className="chips">
            {currencyList.map((c) => (
              <button
                key={c.fireblockAssetId}
                type="button"
                className={currencyWatch === c.fireblockAssetId ? "on" : ""}
                onClick={() => setValue("currency", c.fireblockAssetId)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="fld">
          <label>Billing description</label>
          <div className="tbl-wrap" style={{ border: "1px solid var(--line-2)", borderRadius: 12 }}>
            <table className="tbl" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ width: 140 }}>Amount</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {billingItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        className="inp"
                        placeholder="Line item"
                        value={item.description}
                        onChange={(e) =>
                          setBillingItems((prev) =>
                            prev.map((bi) =>
                              bi.id === item.id ? { ...bi, description: e.target.value } : bi,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="mut">{currencyData.symbol}</span>
                        <input
                          className="inp"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) =>
                            setBillingItems((prev) =>
                              prev.map((bi) =>
                                bi.id === item.id ? { ...bi, amount: e.target.value } : bi,
                              ),
                            )
                          }
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        aria-label="Remove line"
                        onClick={() => removeBillingItem(item.id)}
                        disabled={billingItems.length === 1}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-pink" style={{ marginTop: 10, alignSelf: "flex-start" }} onClick={addBillingItem}>
            + Add item
          </button>
        </div>

        <div className="fld">
          <label>Total</label>
          <div className="inp" style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f9fa" }}>
            <span className="mut">{currencyData.symbol}</span>
            <strong>{totalAmount.toFixed(2)}</strong>
            {currencyWatch && <span className="sm">({currencyWatch})</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddInvoice;
