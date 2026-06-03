import { MenuItem, Select } from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";

interface ProcessingRow {
  dateTime: string;
  clientId: string;
  customerEmail: string;
  merchantName: string;
  uniqueId: string;
  orderId: string;
  status: "Completed" | "Pending" | "Failed";
  requestedAmount: string;
  fee: string;
  receivedAmount: string;
  transactionType: string;
  walletAsset: string;
  fromAddress: string;
  toAddress: string;
  asset: string;
  transactionId: string;
}

const mockRows: ProcessingRow[] = Array.from({ length: 6 }).map(() => ({
  dateTime: "13-05-2026 3:56 PM",
  clientId: "566",
  customerEmail: "customer@example.com",
  merchantName: "Merchant",
  uniqueId: "9JDFHDF87F",
  orderId: "order-jgjfg8888",
  status: "Completed",
  requestedAmount: "0.9 USD",
  fee: "0",
  receivedAmount: "$1300.00",
  transactionType: "Outgoing Transfer",
  walletAsset: "USDT (ERC20)",
  fromAddress: "0Z56DJFHG54665XXXCC4555F76GH",
  toAddress: "0Z56DJFHG54665XXXCC4555F76GH",
  asset: "USDT (Polygon)",
  transactionId: "HFhgh8.......JKHJ778",
}));

const shortAddress = (addr: string) =>
  addr.length > 10 ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : addr;

const CopyText = ({
  display,
  value,
  className = "",
}: {
  display: string;
  value: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Failed to copy");
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : value}
      className={`cursor-pointer hover:underline ${className}`}
    >
      {copied ? "Copied!" : display}
    </button>
  );
};

const StatusBadge = ({ status }: { status: ProcessingRow["status"] }) => {
  const styles =
    status === "Completed"
      ? "bg-emerald-500 text-white"
      : status === "Pending"
        ? "bg-amber-400 text-white"
        : "bg-red-500 text-white";
  return (
    <span className={`rounded px-3 py-1 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
};

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div className="flex-1">
    <p className="mb-1 text-sm text-slate-700">{label}</p>
    <Select
      sx={{
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
      }}
      value={value}
      size="small"
      displayEmpty
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg bg-white"
    >
      <MenuItem value="">
        <span className="text-slate-400">&nbsp;</span>
      </MenuItem>
      {options.map((o) => (
        <MenuItem key={o} value={o}>
          {o}
        </MenuItem>
      ))}
    </Select>
  </div>
);

const ProcessingHistoryTable = () => {
  const [currency, setCurrency] = useState("");
  const [transaction, setTransaction] = useState("");
  const [merchants, setMerchants] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="mt-4">
      {/* Inner filter row */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={["USD", "EUR", "USDT"]}
          />
          <FilterSelect
            label="Transaction"
            value={transaction}
            onChange={setTransaction}
            options={["Incoming", "Outgoing"]}
          />
          <FilterSelect
            label="Merchants"
            value={merchants}
            onChange={setMerchants}
            options={["Merchant A", "Merchant B"]}
          />
          <div className="flex-1">
            <p className="mb-1 text-sm text-slate-700">Start Date</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
            />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-sm text-slate-700">End Date</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <th className="whitespace-nowrap px-4 py-3 font-medium">Date and Time</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Client ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Customer E-mail</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Merchant Name</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Unique ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Order ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Status</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Requested Amount</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Fee</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Received Amount</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Transaction Type</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Wallet</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Asset</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {mockRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">{row.dateTime}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">{row.clientId}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                  {row.customerEmail}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                  {row.merchantName}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">{row.uniqueId}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">{row.orderId}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                  {row.requestedAmount}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">{row.fee}</td>
                <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
                  {row.receivedAmount}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                  {row.transactionType}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      $
                    </div>
                    <div className="leading-tight">
                      <div className="font-medium text-slate-800">
                        {row.walletAsset}
                      </div>
                      <div className="text-xs text-slate-600">
                        From{" "}
                        <CopyText
                          display={shortAddress(row.fromAddress)}
                          value={row.fromAddress}
                          className="text-blue-500"
                        />{" "}
                        To{" "}
                        <CopyText
                          display={shortAddress(row.toAddress)}
                          value={row.toAddress}
                          className="text-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                  {row.asset}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <CopyText
                    display={row.transactionId}
                    value={row.transactionId}
                    className="text-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessingHistoryTable;
