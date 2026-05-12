import useGlobalStore from "~/store/useGlobalStore";

const hydrateStore = () => {
  useGlobalStore.persist.rehydrate();
};

export default hydrateStore;
