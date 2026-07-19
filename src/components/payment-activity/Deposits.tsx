import React, { useEffect, useState } from "react";
import { getPaymentActivity } from "~/service/api/accounts";
import { euroFormat } from "~/helpers/helper";

interface Totals {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  last24HoursAmount: number;
  last7DaysAmount: number;
  last30DaysAmount: number;
}

const Deposits = () => {
  const [depositTotals, setDepositTotals] = useState<Totals>({
    last24Hours: 0,
    last7Days: 0,
    last30Days: 0,
    last24HoursAmount: 0,
    last7DaysAmount: 0,
    last30DaysAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const [response] = await getPaymentActivity();

    if (response?.body) {
      const {
        deposit24hCount,
        deposit7dCount,
        deposit30dCount,
        deposit24hAmount,
        deposit7dAmount,
        deposit30dAmount
      } = response.body;

      setDepositTotals({
        last24Hours: Number(deposit24hCount) || 0,
        last7Days: Number(deposit7dCount) || 0,
        last30Days: Number(deposit30dCount) || 0,
        last24HoursAmount: Number(deposit24hAmount) || 0,
        last7DaysAmount: Number(deposit7dAmount) || 0,
        last30DaysAmount: Number(deposit30dAmount) || 0
      });
    }
  };

  const ActivityCard = ({
    title,
    count,
    amount
  }: {
    title: string,
    count: number,
    amount: number
  }) => (
    <div className="flex flex-col gap-6 rounded-2xl bg-[#F8F9FA] p-6 shadow-sm border border-gray-50">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-[#8B8D91]">{title}</p>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-[#1A1C1E]">
              € {euroFormat(amount)}
            </p>
            <span className="text-xs font-bold text-[#10B981]">+4.2%</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[#8B8D91]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-bold">{count} Transactions</span>
          </div>
        </div>
      </div>

      {/* Mini Bar Chart - matching image deeply */}
      <div className="flex items-end gap-1.5 h-12 w-full mt-2 px-1">
        <div className="h-[25%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[45%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[35%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[25%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[65%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[55%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[100%] w-full rounded-md bg-primary-gradient shadow-sm"></div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <ActivityCard
        title="Last 24 hours"
        count={depositTotals.last24Hours}
        amount={depositTotals.last24HoursAmount}
      />
      <ActivityCard
        title="Last 7 Days"
        count={depositTotals.last7Days}
        amount={depositTotals.last7DaysAmount}
      />
      <ActivityCard
        title="Last 30 Days"
        count={depositTotals.last30Days}
        amount={depositTotals.last30DaysAmount}
      />
    </div>
  );
};

export default Deposits;
