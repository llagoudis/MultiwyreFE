"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";
import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
import toast from "react-hot-toast";
import useGlobalStore from "~/store/useGlobalStore";
import useDashboard from "~/hooks/useDashboard";
const Dashboard = dynamic(() => import("~/components/dashboard/Dashboard"), {
  ssr: false,
});

const UserDashboard = () => {
  const dashboard = useDashboard();

  const [isComplete, completeSetup] = useGlobalStore((state) => [
    state.setupComplete,
    state.completeSetup,
  ]);

  const [isClient, setIsClient] = useState(false);

  const _completeSetup = async () => {
    if (isComplete !== "COMPLETE") {
      await completeSetup().then((result) => {
        if (!result) {
          toast.error("Failed to load. Please try again later.");
        }
      });
    }
  };

  useEffect(() => {
    setIsClient(true);
    _completeSetup();
    useGlobalStore.getState().syncAdminProfile();
  }, []);

  return (
    <Layout title="Dashboard">
      {isClient &&
        (!dashboard.updatedWithApi || isComplete !== "COMPLETE" ? (
          <div className="flex min-h-[90vh] flex-col items-center justify-center gap-10">
            <CircularProgress color="inherit" size={70} />
            <p className="text-xl">Loading account details.</p>
          </div>
        ) : (
          <Dashboard />
        ))}
    </Layout>
  );
};

export default withAuth(UserDashboard);
