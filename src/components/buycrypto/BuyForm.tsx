/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { countryFlags, currencyFlags, currencyFlagsOne } from "./helper";
import Dropdown from "~/assets/general/custom-dropdown.svg";
import Clock from "~/assets/general/clock.svg";
import Background from "~/assets/general/Background.svg";
import Image, { type StaticImageData } from "next/image";
import CurrencyDrawer from "./CurrencyDrawer";
import InputAdornment from "@mui/material/InputAdornment";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import ButtonField from "./components/ButtonField";
import InputField from "./components/InputField";
import ArrowRight from "~/assets/general/right-arrow.svg";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { fetchCheckoutFees } from "~/service/ApiRequests";
import { coinName } from "~/helpers/helper";
import PaymentDrawer from "./components/PaymentDrawer";
import { IoIosArrowDown } from "react-icons/io";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

type Country = {
  countryCode: number;
  flag: string | { src: string };
  name: string;
};

type Currency = {
  currencyCode: number;
  flag: string | { src: string };
  name: string;
  subname: string;
  feeCurrencyName: string;
};
type screen = {
  changeScreen: (screen: string) => void;
  setPaymentType: (type: string) => void;
  trxDetails: CheckoutTransaction;
  updateTrxById: (data: CheckoutTransaction) => void;
  isUpdating: boolean;
  verificationResponse: VerificationResponseType;
};

const basePaymentMethods = [
  {
    name: "Card",
    icons: ["/icons/visa.svg"],
    fee: "1.75%",
    key: "card",
    available: true,
  },
  {
    name: "Apple Pay",
    key: "apple_pay",
    icons: ["/icons/apple-icon.svg"],
    fee: "1.75%",
    available: false,
  },
  {
    name: "Google Pay",
    key: "google_pay",
    icons: ["/icons/google-icon.svg"],
    fee: "1.75%",
    available: false,
  },
  {
    name: "Mpesa",
    key: "m-pesa",
    icons: ["/icons/mpesa.svg"],
    fee: "1.75%",
    available: false,
  },
  {
    name: "Bank Transfer",
    key: "bank_transfer",
    icons: ["/icons/bank-transfer.svg"],
    fee: "1.75%",
    available: true,
  },
  {
    name: "Paypal",
    key: "paypal",
    icons: ["/icons/paypal.svg"],
    fee: "1.75%",
    available: true,
  },
];

type PaymentChecker = {
  currency: string;
  amount: number;
  paymentMethods: typeof basePaymentMethods;
};

const PaymentMethodChecker = ({
  currency = "usd",
  amount = 100,
  paymentMethods,
}: PaymentChecker) => {
  const stripe = useStripe();

  useEffect(() => {
    const checkMethods = async () => {
      if (!stripe) return;

      // Check Apple Pay / Google Pay
      try {
        const pr = stripe.paymentRequest({
          country: "US",
          currency: currency.toLowerCase() || "usd",
          total: {
            label: "Payment",
            amount: Math.round(amount * 100),
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        const result = await pr.canMakePayment();

        if (result?.applePay) {
          const applePayMethod = paymentMethods.find(
            (method) => method.name === "Apple Pay",
          );
          if (applePayMethod) {
            applePayMethod.available = true;
          }
        }

        if (result?.googlePay) {
          const googlePayMethod = paymentMethods.find(
            (method) => method.name === "Google Pay",
          );
          if (googlePayMethod) {
            googlePayMethod.available = true;
          }
        }
      } catch (error) {}
    };

    checkMethods();
  }, [stripe, currency, amount, paymentMethods]);

  return null; // This component doesn't render anything
};

const BuyForm: React.FC<screen> = ({
  trxDetails,
  isUpdating,
  updateTrxById,
  verificationResponse,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutTransaction>({});

  const [selected, setSelected] = useState<string>("Card");
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [stripePromise, setStripePriomise] = useState<any>();
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countryFlags[0] ?? { countryCode: 0, flag: "", name: "Unknown" },
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getFlagSrc = (flag: Country["flag"]) =>
    typeof flag === "string" ? flag : flag.src;

  //   Currency
  const [fiatCurrency, setFiatCurrency] = useState<Currency>(
    currencyFlagsOne[0] ?? {
      currencyCode: 0,
      flag: "",
      name: "Unknown",
      subname: "Unknown",
      feeCurrencyName: "Unknown",
    },
  );
  const [currencydrawerOpen, setCurrencyDrawerOpen] = useState(false);

  const getCurrencyFlagSrc = (flag: Currency["flag"]) =>
    typeof flag === "string" ? flag : flag.src;

  //   Currency Recieve
  const [recieverCurrency, setRecieverCurrency] = useState<Currency>(
    currencyFlags[0] ?? {
      currencyCode: 0,
      flag: "",
      name: "Unknown",
      subname: "Unknown",
      feeCurrencyName: "Unknown",
    },
  );
  const [revieveDrawer, setRecieveDrawer] = useState(false);

  const getCurrencyRecieveFlagSrc = (flag: Currency["flag"]) =>
    typeof flag === "string" ? flag : flag.src;

  const [seconds, setSeconds] = useState(10);

  // Update payment methods based on fiat currency

  const filteredPaymentMethods = basePaymentMethods.filter(
    (item) =>
      verificationResponse?.availablePayments?.some(
        (p) => p.name === item.name,
      ),
  );

  const paymentMethods = filteredPaymentMethods.map((method) => {
    if (method.key === "bank_transfer") {
      return {
        ...method,
        available: fiatCurrency.subname.toLowerCase() !== "usd",
      };
    }
    return method;
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Call reverse geocoding API (free options: OpenCage, BigDataCloud, etc.)
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        );
        const data = await res.json();

        const found = countryFlags.find((c) => c.subname === data.countryCode);

        if (found) {
          setSelectedCountry(found);
        }
      });
    }

    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [fees, setFees] = useState<any>(null);

  async function getCheckoutFees(id: number | null) {
    const [res, error] = await ApiHandler(fetchCheckoutFees, { id });

    if (res?.success) {
      setFees(res);
    }

    if (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    if (trxDetails?.merchantId) {
      getCheckoutFees(trxDetails?.merchantId);
    }

    if (verificationResponse?.publicKey) {
      const stripePromise = loadStripe(verificationResponse?.publicKey ?? "");
      setStripePriomise(stripePromise);
    }
  }, [trxDetails, verificationResponse]);

  const isAnyDrawerOpen = drawerOpen || currencydrawerOpen || revieveDrawer;

  const onSubmit = (data: CheckoutTransaction) => {
    const networkFee =
      fees?.body?.merchant?.User?.PriceList?.TransferFees?.find(
        (item: any) =>
          item?.operationType === 3 &&
          (item?.currencyId === "ANY" ||
            item?.currencyId === fiatCurrency?.subname),
      );

    const processingFee =
      fees?.body?.merchant?.User?.PriceList?.TransferFees?.find(
        (item: any) =>
          item?.operationType === 8 &&
          (item?.currencyId === "ANY" ||
            item?.currencyId === fiatCurrency?.subname),
      );

    const calculateFee = (feeObj: any): number => {
      const fixed = Number(feeObj?.fixedFee ?? 0);
      const percent = Number(feeObj?.percent ?? 0);
      return fixed + (percent * fiatAmount) / 100;
    };

    const networkFeeValue = networkFee ? calculateFee(networkFee) : 0;
    const processingFeeValue = processingFee ? calculateFee(processingFee) : 0;
    const totalFees = networkFeeValue + processingFeeValue;
    const finalFiatAmountWithFees = Number(fiatAmount) + Number(totalFees);

    const reqBody = {
      ...data,
      country: selectedCountry.name,
      receiverCurrency: recieverCurrency.feeCurrencyName,
      fiatCurrency: fiatCurrency.subname,
      paymentMethod: selected,
      fiatAmountAfterFees: finalFiatAmountWithFees,
      processingFee: processingFeeValue ?? 0,
      networkFee: networkFeeValue ?? 0,
      price: watch("price") ?? 0,
      fxmarkUp: watch("fxmarkUp") ?? 0,
      screen: "screen2",
    };

    void updateTrxById(reqBody);
  };

  const { fiatAmount } = watch();

  async function convertCurrency() {
    try {
      const pair = `${
        recieverCurrency.name === "USDT.t" ? "USDT" : recieverCurrency.name
      }/${fiatCurrency.subname}`;

      const res = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      );
      const data: any = await res.json();

      const pairKey = Object.keys(data.result)[0];
      const price = pairKey ? parseFloat(data.result[pairKey]?.c[0] ?? "0") : 0;

      // Safely extract fxMarkup
      console.log(
        "coinName(recieverCurrency.name): ",
        coinName(recieverCurrency.name),
      );
      const fxMarkupItem =
        fees?.body?.merchant?.User?.PriceList?.FxMarkupFees.find(
          (item: any) =>
            (item?.fromCurrencyId === "ANY" ||
              item?.fromCurrencyId === fiatCurrency.subname) &&
            (item?.toCurrencyId === "ANY" ||
              item?.toCurrencyId === coinName(recieverCurrency.name)),
        );

      const fxMarkup = fxMarkupItem?.percent ?? 0;

      setValue("fxmarkUp", fxMarkup);

      setValue("price", price);
      // Calculate converted amount
      let converted = fiatAmount / price;

      // Apply markup (e.g., 2% markup reduces amount by 2%)

      if (fxMarkup) {
        const markupMultiplier = 1 - fxMarkup / 100;
        converted *= markupMultiplier;
      }

      if (converted) setValue("receiverAmount", converted);
    } catch (e) {}
  }

  useEffect(() => {
    if (fiatAmount) {
      convertCurrency();
    }
  }, [fiatAmount, fiatCurrency.subname, recieverCurrency.name]);

  const firstThree = paymentMethods.slice(0, 3);
  const remainingMethods = paymentMethods.slice(3);

  return (
    <>
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <PaymentMethodChecker
            currency={fiatCurrency?.subname}
            amount={10}
            paymentMethods={paymentMethods}
          />
        </Elements>
      )}

      <form className="" onSubmit={handleSubmit(onSubmit)}>
        {/* Right */}
        <div className="relative h-screen w-full overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg md:h-[625px] md:w-[535px]">
          {isAnyDrawerOpen && (
            <div
              className="pointer-events-auto fixed inset-0 z-10 bg-black opacity-50"
              onClick={() => {
                setDrawerOpen(false);
                setCurrencyDrawerOpen(false);
                setRecieveDrawer(false);
              }}
            />
          )}
          <div className="flex items-center justify-between pb-16">
            <h1 className="text-[25px] font-bold">Buy</h1>

            <div className="relative w-40" onClick={() => setDrawerOpen(true)}>
              <div className="relative cursor-pointer rounded border border-gray-300 bg-white p-[11px] pl-3 pr-10 text-left shadow-sm">
                <span className="flex items-center">
                  <img
                    src={getFlagSrc(selectedCountry.flag)}
                    alt={selectedCountry.name}
                    className="mr-2 h-[22px] w-[22px] rounded-full object-cover"
                  />
                  <span className="font-manrope block truncate font-semibold">
                    {selectedCountry.name}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <img
                    src={(Dropdown as StaticImageData).src}
                    alt="Dropdown Arrow"
                    className={`h-4 w-4 transform transition-transform duration-200 `}
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <InputField
                name="fiatAmount"
                control={control}
                label="Pay"
                errors={errors}
                rules={{
                  required: "Amount is required",
                }}
                placeholder="Enter amount"
              />
              <div className="absolute right-[20px] top-1/2 -translate-y-1/2">
                <InputAdornment position="end">
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{ gap: "6px", overflow: "hidden" }}
                    onClick={() => setCurrencyDrawerOpen(true)}
                  >
                    {/* Flag */}
                    <img
                      src={getCurrencyFlagSrc(fiatCurrency.flag)}
                      alt="flag"
                      style={{
                        height: 18,
                        width: 18,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />

                    {/* Country Name */}
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#000",
                        whiteSpace: "nowrap",
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {fiatCurrency.name}
                    </Typography>

                    {/* Dropdown Icon */}
                    <img
                      src={(Dropdown as StaticImageData).src}
                      alt="dropdown"
                      style={{
                        height: 16,
                        width: 16,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </InputAdornment>
              </div>
            </div>

            <div className="relative">
              <InputField
                name="receiverAmount"
                control={control}
                label="Recieve"
                errors={errors}
                placeholder="000 000"
                disabled={true}
              />

              <div className="absolute right-[20px] top-1/2 -translate-y-1/2">
                <InputAdornment position="end">
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{ gap: "6px", overflow: "hidden" }}
                    onClick={() => setRecieveDrawer(true)}
                  >
                    {/* Flag */}
                    <img
                      src={getCurrencyRecieveFlagSrc(recieverCurrency.flag)}
                      alt="flag"
                      style={{
                        height: 18,
                        width: 18,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />

                    {/* Country Name */}
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 600,
                        color: "#000",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {recieverCurrency.name}
                    </Typography>

                    {/* Dropdown Icon */}
                    <img
                      src={(Dropdown as StaticImageData).src}
                      alt="dropdown"
                      style={{
                        height: 16,
                        width: 16,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </InputAdornment>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-1 p-2 text-[#8C8C8C]">
            <Image
              src={(Clock as StaticImageData).src}
              alt="Looping"
              height={10}
              width={10}
            />
            <span className="text-[12px]"> {seconds} </span>
          </div>

          <div>
            <p className="mt-4 text-[16px] font-[700]">Choose payment method</p>
            <div className=" mt-5 flex flex-wrap gap-4">
              {firstThree.map((method) => {
                const isSelected = selected === method.name;
                const isAvailable = method.available;

                return (
                  <span
                    key={method.name}
                    onClick={() => {
                      if (isAvailable) {
                        setSelected(method.name);
                      }
                    }}
                    className={`relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-8 py-4 transition-all ${
                      !isAvailable
                        ? "cursor-not-allowed opacity-50"
                        : isSelected
                        ? "border-1 border-[#4D00EC]"
                        : "border-1 border-[#E5E7EB]"
                    }`}
                  >
                    {isSelected && isAvailable && (
                      <Image
                        src={(Background as StaticImageData).src}
                        alt="Looping"
                        width={40}
                        height={40}
                        className="absolute right-[-6px] top-[-6px] h-4 w-4 text-purple-700"
                      />
                    )}

                    <div className="flex items-center">
                      {method.icons.map((icon, idx) => (
                        <Image
                          key={idx}
                          src={icon}
                          alt={method.name}
                          width={80}
                          height={80}
                          className={!isAvailable ? "opacity-50" : ""}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs ${
                        !isAvailable ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Fee: {method.fee}
                    </span>
                    {!isAvailable && (
                      <span className="absolute -top-2 right-0 rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-500">
                        Unavailable
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            {remainingMethods?.length > 0 && (
              <Box display={"grid"} marginY={2} justifyContent={"center"}>
                <Typography
                  className="flex w-full cursor-pointer items-center gap-2 text-center font-semibold text-[#4D01EA]"
                  onClick={() => setPaymentDrawerOpen(true)}
                >
                  More Payment Methods
                  <IoIosArrowDown />
                </Typography>
              </Box>
            )}
          </div>

          <Box marginTop={"auto"}>
            <ButtonField
              loading={isUpdating}
              icon={ArrowRight}
              type="submit"
              disabled={isUpdating}
            >
              Continue
            </ButtonField>
          </Box>

          <CurrencyDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            selectedItem={selectedCountry}
            onSelect={(item) => setSelectedCountry(item as Country)}
            itemList={countryFlags}
            title="Select Country"
          />

          <CurrencyDrawer
            isOpen={currencydrawerOpen}
            onClose={() => setCurrencyDrawerOpen(false)}
            selectedItem={fiatCurrency}
            onSelect={(item) => setFiatCurrency(item as Currency)}
            itemList={currencyFlagsOne}
            title="Select Currency"
          />

          <CurrencyDrawer
            isOpen={revieveDrawer}
            onClose={() => setRecieveDrawer(false)}
            selectedItem={recieverCurrency}
            onSelect={(item) => setRecieverCurrency(item as Currency)}
            itemList={currencyFlags}
            title="Select Currency"
          />

          <PaymentDrawer
            selected={selected}
            isOpen={paymentDrawerOpen}
            onClose={() => setPaymentDrawerOpen(false)}
            onSelect={(method) => {
              setSelected(method);
            }}
            paymentMethods={remainingMethods}
          />
        </div>
      </form>
    </>
  );
};

export default BuyForm;
