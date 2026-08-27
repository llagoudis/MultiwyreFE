import { useEffect } from "react";
import useGlobalStore from "~/store/useGlobalStore";

const useDashboard = () => {
  const [state, sync, setupComplete] = useGlobalStore((state) => [
    state.dashboard,
    state.syncDashboard,
    state.setupComplete,
  ]);

  useEffect(() => {
    // Always refetch for the current session (QA #68 — no stale dashboard gate)
    void sync();
  }, [setupComplete]);

  return state;
};

export default useDashboard;
