import { useEffect, useState, Fragment, useRef } from "react";
import WarningMsg from "../common/WarningMsg";
import WalletCard from "./WalletCard";
import VerificationScreen from "../verification/identity-verification/MainScreen";
import CompanyVerification from "../verification/company-verification/MainScreen";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import DepositDrawer from "./DepositDrawer";
import ExchangeDrawer from "./ExchangeDrawer";
import WithdrawDrawer from "./WithdrawDrawer";
import AddWhitelistDrawer from "./AddWhitelistDrawer";
import TableComponent from "../TableComponent";
import { euroFormat } from "~/helpers/helper";
import Head from "next/head";
import BlackRightArrow from "../../assets/general/back_arrow_r.svg";
import BlackLeftArrow from "../../assets/general/back_arrow_l.svg";
import PaymentActivity from "../payment-activity/paymentActivity";
import { checkMerchants } from "~/service/api/accounts";
import Image, { type StaticImageData } from "next/image";
import arrowUp from "../../assets/general/send_money.svg";
import arrowDown from "../../assets/general/receive_money.svg";
import transfer from "../../assets/general/transfer_money.svg";
import { DownloadIcon, ExchangeIcon, UploadIcon, WalletIcon } from "~/assets/svgs";
type imageType = StaticImageData;
interface verificationStateType {
  identity: verificationStates;
  company: verificationStates;
}

interface AuthBody {
  userType: string;
}

const Dashboard = () => {
  const dashboard = useGlobalStore((state) => state.dashboard);

  const mergedAssets = [...dashboard.assets];

  const splitIntoChunks = (array: any, chunkSize: any) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const assetChunks = splitIntoChunks(mergedAssets, 6);

  // Slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const divReference = useRef<HTMLDivElement>(null);
  const [assetsHeight, setAssetsHeight] = useState<number>(0);

  useEffect(() => {
    if (divReference.current) {
      setAssetsHeight(divReference.current.offsetHeight);
    }
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % assetChunks.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + assetChunks.length) % assetChunks.length,
    );
  };

  // -------- end -----------

  const admin = useGlobalStore((state) => state.admin);

  useEffect(() => {
    useGlobalStore.getState().syncDashboard();
  }, []);

  const companyVerified = false;

  const [companyVerificationScreen, setCompanyVerificationScreen] =
    useState<boolean>(false);

  const [identityVerification, setIdentityVerification] =
    useState<boolean>(false);

  const [verificationStatus, setVerificationStatus] =
    useState<verificationStateType>({
      identity: "SUBMITTED",
      company: "SUBMITTED",
    });

  const [authBody, setAuthBody] = useState<AuthBody | null>(null);
  const [merchantsAvailable, setMerchantsAvailable] = useState<boolean>(false);

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [addWhitelistOpen, setAddWhitelistOpen] = useState(false);

  const handleCompanyVerifyScreen = (value: boolean) => {
    setCompanyVerificationScreen(value);
    localStorageService.updateVerification({
      companyVerificationScreen: value,
    });
    const companyVerification = localStorageService.decodeVerification();

    if (
      companyVerification?.companyVerificationScreenObj?.accountCreationSuccess
    ) {
      setVerificationStatus((prev) => ({
        ...prev,
        company: "SUBMITTED",
      }));
      localStorageService.updateAuthBody({ isCompanyVerified: "SUBMITTED" });
    }
  };

  const handleVerifyScreen = (value: boolean) => {
    setIdentityVerification(value);

    localStorageService.updateVerification({ identityVerification: value });

    const verification = localStorageService.decodeVerification();
    if (verification.identityVerificationObj?.successScreen) {
      setVerificationStatus((prev) => ({
        ...prev,
        identity: "SUBMITTED",
      }));
      localStorageService.updateAuthBody({ isUserVerified: "SUBMITTED" });
    }
  };

  useEffect(() => {
    const verification = localStorageService.decodeVerification();
    const identity = verification?.identityVerification || false;
    const company = verification?.companyVerificationScreen || false;
    setIdentityVerification(identity);
    setCompanyVerificationScreen(company);
    localStorageService.updateVerification({
      identityVerification: identity,
      companyVerificationScreen: company,
    });

    const authBody = localStorageService.decodeAuthBody();
    setAuthBody(authBody);

    void fetchMerchants();

    if (authBody) {
      setVerificationStatus((prev) => ({
        ...prev,
        identity: authBody.isUserVerified,
        company: authBody.isCompanyVerified,
      }));
    }
  }, []);

  const fetchMerchants = async () => {
    const [response] = await checkMerchants();
    if (response?.body) {
      setMerchantsAvailable(true);
    } else {
      setMerchantsAvailable(false);
    }
  };

  let sum = 0;
  dashboard.assets?.map((item) => {
    sum = sum + Number(item.assetValue);
  });

  return (
    <Fragment>
      <Head>
        <title>{admin?.tabName ?? "Exchange your crypo currencies"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Company verification */}
      {verificationStatus.identity === "PENDING" && (
        <WarningMsg
          handleClick={() => handleVerifyScreen(true)}
          element={
            <span>
              Complete your{" "}
              <span className="font-bold">Identity Verification</span> to
              continue using exchange services
            </span>
          }
        />
      )}

      {!companyVerified &&
        verificationStatus.company === "PENDING" &&
        verificationStatus.identity !== "PENDING" && (
          <WarningMsg
            element={
              <span>
                Complete your{" "}
                <span className="font-bold">Company Verification</span> to
                continue using exchange services
              </span>
            }
            handleClick={() => handleCompanyVerifyScreen(true)}
          />
        )}
      {/* Section 1: Welcome Board */}
      <div className="welcomeBoard  flex flex-col rounded-xl bg-primary-gradient p-4 text-white shadow-lg">
        <div>
          <p className="text-xl">
            Welcome, {`${dashboard.firstname ?? ""} ${dashboard?.lastname ?? ""}`} 👋
          </p>
          <p className="mt-2 text-sm">
            Your dashboard is all set and ready for you to explore now.
          </p>
        </div>
      </div>

      {/* Combined Section: Total Balance + Assets Area */}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        {/* Total Balance Area */}
        <div className="bg-[#FBFBFB] p-4 rounded-xl flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-black">
              <div className="border border-[#7E7E7E57] rounded-md p-2">
                <WalletIcon />
              </div>
              <span className=" font-bold uppercase tracking-wider">Total Balance</span>
            </div>

            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-xl md:text-3xl font-bold text-black">€ 1,05,068</span>
              <span className="text-xl md:text-3xl font-bold text-[#8B8D91]">.00</span>
            </div>
            <p className="text-sm font-medium text-[#8B8D91]">
              All accounts balance in {dashboard.currency}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              onClick={() => setDepositOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-md bg-[#EEF1FF] px-4 md:px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#E2E8FF]"
            >
              <DownloadIcon />
              Deposit
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-md bg-[#EEF1FF] px-4 md:px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#E2E8FF]"
            >
              <UploadIcon />
              Withdraw
            </button>
            <button
              onClick={() => setExchangeOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-md bg-[#EEF1FF] px-4 md:px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#E2E8FF]"
            >
              <ExchangeIcon />
              Exchange
            </button>
          </div>
        </div>

        {/* Assets Area */}
        <div ref={divReference}>
          <p className="text-2xl font-bold text-[#1A1C1E] mb-2">Assets</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {assetChunks.flat().map((item: any, itemIndex: any) => (
              <WalletCard
                key={itemIndex}
                walletDetails={item}
                currency={dashboard.currency}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="my-6">
        <PaymentActivity />
      </div>

      {identityVerification && verificationStatus.identity === "PENDING" && (
        <VerificationScreen close={() => handleVerifyScreen(false)} />
      )}

      {companyVerificationScreen &&
        verificationStatus.company === "PENDING" && (
          <CompanyVerification close={() => handleCompanyVerifyScreen(false)} />
        )}

      <DepositDrawer
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        assets={dashboard.assets}
      />

      <ExchangeDrawer
        open={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        assets={dashboard.assets}
      />

      <WithdrawDrawer
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        assets={dashboard.assets}
        onAddWhitelist={() => {
          setWithdrawOpen(false);
          setAddWhitelistOpen(true);
        }}
      />

      <AddWhitelistDrawer
        open={addWhitelistOpen}
        onClose={() => setAddWhitelistOpen(false)}
        assets={dashboard.assets}
      />
    </Fragment>
  );
};

export default Dashboard;
