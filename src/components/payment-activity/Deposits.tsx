import React, { useEffect, useState } from "react";
import { getPaymentActivity } from "~/service/api/accounts";

interface TransactionData {
  projectId: number;
  last24HoursCount: number;
  last7DaysCount: number;
  last30DaysCount: number;
}

interface Totals {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

const Deposits = () => {
  const [depositTotals, setDepositTotals] = useState<Totals>({ last24Hours: 0, last7Days: 0, last30Days: 0 });
  const [withdrawalTotals, setWithdrawalTotals] = useState<Totals>({ last24Hours: 0, last7Days: 0, last30Days: 0 });

  useEffect(() => {
    fetchTransactions(); 
  }, []);

  const fetchTransactions = async () => {
    const [response] = await getPaymentActivity(); 

    if (response?.body) {
      const { deposits, withdrawals } = response.body; 

      // Calculate totals for deposits
      const depositCounts = deposits.reduce((acc: Totals, curr: TransactionData) => {
        acc.last24Hours += curr.last24HoursCount;
        acc.last7Days += curr.last7DaysCount;
        acc.last30Days += curr.last30DaysCount;
        return acc;
      }, { last24Hours: 0, last7Days: 0, last30Days: 0 });

      // Calculate totals for withdrawals
      const withdrawalCounts = withdrawals.reduce((acc: Totals, curr: TransactionData) => {
        acc.last24Hours += curr.last24HoursCount;
        acc.last7Days += curr.last7DaysCount;
        acc.last30Days += curr.last30DaysCount;
        return acc;
      }, { last24Hours: 0, last7Days: 0, last30Days: 0 });

      // Update state with calculated totals
      setDepositTotals(depositCounts);
      setWithdrawalTotals(withdrawalCounts);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {/* Last 24 Hours */}
      <div className="flex flex-col gap-2 rounded-md border-x-[1px] border-b-4 border-t-[1px] border-[#FFAD00B2] px-4 py-6">
        <p className="text-[22px] font-bold">Last 24 Hours</p>
        <p className="text-sm font-normal">Deposits Transactions: {depositTotals.last24Hours}</p>
        <p className="text-sm font-normal">Withdraw Transactions: {withdrawalTotals.last24Hours}</p>
      </div>

      {/* Last 7 Days */}
      <div className="flex flex-col gap-2 rounded-md border-x-[1px] border-b-4 border-t-[1px] border-[#FFAD00B2] px-4 py-6">
        <p className="text-[22px] font-bold">Last 7 Days</p>
        <p className="text-sm font-normal">Deposits Transactions: {depositTotals.last7Days}</p>
        <p className="text-sm font-normal">Withdraw Transactions: {withdrawalTotals.last7Days}</p>
      </div>

      {/* Last 30 Days */}
      <div className="flex flex-col gap-2 rounded-md border-x-[1px] border-b-4 border-t-[1px] border-[#FFAD00B2] px-4 py-6">
        <p className="text-[22px] font-bold">Last 30 Days</p>
        <p className="text-sm font-normal">Deposits Transactions: {depositTotals.last30Days}</p>
        <p className="text-sm font-normal">Withdraw Transactions: {withdrawalTotals.last30Days}</p>
      </div>
    </div>
  );
};

export default Deposits;

