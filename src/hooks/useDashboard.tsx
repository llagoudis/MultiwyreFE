import { useEffect } from "react";
import useGlobalStore from "~/store/useGlobalStore";

const useDashboard = () => {
  const [state, sync, setupComplete] = useGlobalStore((state) => [
    state.dashboard,
    state.syncDashboard,
    state.setupComplete,
  ]);

  useEffect(() => {
    if (!state.updatedWithApi && setupComplete === "COMPLETE") {
      sync();
    }
  }, [setupComplete]);

  return state;
};

export default useDashboard;
