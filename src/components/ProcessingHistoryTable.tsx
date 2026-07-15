import {MenuItem, Select} from "@mui/material";
import {useState} from "react";

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
  senderAsset: string;
  senderAddress: string;
  receiverAsset: string;
  receiverAddress: string;
  transactionId: string;
}

const mockRows: ProcessingRow[] = Array.from({length: 6}).map(() => ({
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
  senderAsset: "USDT (ERC20)",
  senderAddress: "0NGDJFHG54665XXXCC4555FDDFF",
  receiverAsset: "USDT (ERC20)",
  receiverAddress: "0NGDJFHG54665XXXCC4555FDDFF",
  transactionId: "HFhgh8.......JKHJ778",
}));

const StatusBadge = ({status}: { status: ProcessingRow["status"] }) => {
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
        "& .MuiOutlinedInput-notchedOutline": {borderColor: "#e5e7eb"},
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
                <StatusBadge status={row.status}/>
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
                <div className="flex items-center gap-2">
                  {/* Asset Icon - using sender asset as primary */}
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white flex-shrink-0">
                    {row.senderAsset?.charAt(0) || "$"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    {/* Asset Name */}
                    <div className="font-medium text-slate-800">
                      {row.senderAsset}
                    </div>

                    {/* From/To Addresses */}
                    <div className="flex items-center gap-2 text-xs">
                      {/* From Address */}
                      {row.senderAddress && (
                        <div className="flex items-center gap-1">
                          <span className="text-[#a3a3a3]">From:</span>
                          <span className="font-medium text-blue-500">
              {row.senderAddress}
            </span>
                        </div>
                      )}

                      {/* Separator */}
                      {row.senderAddress && row.receiverAddress && (
                        <span className="text-[#a3a3a3]">→</span>
                      )}

                      {/* To Address */}
                      {row.receiverAddress && (
                        <div className="flex items-center gap-1">
                          <span className="text-[#a3a3a3]">To:</span>
                          <span className="font-medium text-blue-500">
              {row.receiverAddress}
            </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              <td className="whitespace-nowrap px-4 py-4 text-blue-500">{row.transactionId}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessingHistoryTable;
