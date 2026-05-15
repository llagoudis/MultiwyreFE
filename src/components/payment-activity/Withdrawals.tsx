import React, { useEffect, useState } from "react";
import { getWithdrawActivity } from "~/service/api/accounts";
import { euroFormat } from "~/helpers/helper";

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

const Withdrawals = () => {
  const [withdrawTotals, setWithdrawTotals] = useState<Totals>({ last24Hours: 0, last7Days: 0, last30Days: 0 });

  useEffect(() => {
    // Using dummy data as the backend endpoint is not available yet
    const dummyWithdrawals: TransactionData[] = [
      { projectId: 1, last24HoursCount: 5, last7DaysCount: 18, last30DaysCount: 42 }
    ];
    
    const withdrawCounts = dummyWithdrawals.reduce((acc: Totals, curr: TransactionData) => {
      acc.last24Hours += curr.last24HoursCount;
      acc.last7Days += curr.last7DaysCount;
      acc.last30Days += curr.last30DaysCount;
      return acc;
    }, { last24Hours: 0, last7Days: 0, last30Days: 0 });

    setWithdrawTotals(withdrawCounts);
  }, []);

  const fetchTransactions = async () => {
    // Function kept for future implementation, but currently using dummy data in useEffect
  };

  const ActivityCard = ({ title, count }: { title: string, count: number }) => (
    <div className="flex flex-col gap-6 rounded-2xl bg-[#F8F9FA] p-6 shadow-sm border border-gray-50">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-[#8B8D91]">{title}</p>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-[#1A1C1E]">
              € 84,210<span className="text-[#1A1C1E] opacity-50">.00</span>
            </p>
            <span className="text-xs font-bold text-[#FF3D71]">-2.8%</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[#8B8D91]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-bold">{count || 5} Transactions</span>
          </div>
        </div>
      </div>
      
      {/* Mini Bar Chart - matching image deeply */}
      <div className="flex items-end gap-1.5 h-12 w-full mt-2 px-1">
        <div className="h-[45%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[25%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[65%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[35%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[55%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[25%] w-full rounded-sm bg-[#E9ECEF]"></div>
        <div className="h-[100%] w-full rounded-md bg-primary-gradient shadow-sm"></div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <ActivityCard title="Last 24 hours" count={withdrawTotals.last24Hours} />
      <ActivityCard title="Last 7 Days" count={withdrawTotals.last7Days} />
      <ActivityCard title="Last 30 Days" count={withdrawTotals.last30Days} />
    </div>
  );
};

export default Withdrawals;
