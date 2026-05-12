import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  InputAdornment,
} from "@mui/material";
import Back from "~/assets/general/back-arrow.svg";
import Email from "~/assets/general/email-message.svg";
import ArrowRight from "~/assets/general/right-arrow.svg";
import Image, { StaticImageData } from "next/image";
import { countryFlags } from "./helper";
import Dropdown from "~/assets/general/custom-dropdown.svg";
import CurrencyDrawer from "./CurrencyDrawer";
import InputField from "./components/InputField";
import MuiButton from "../MuiButton";
import ButtonField from "./components/ButtonField";

type Country = {
  countryCode: number;
  flag: string | { src: string };
  name: string;
};

type screen = {
  changeScreen: (screen: string) => void;
  updateTrxById: (data: CheckoutTransaction) => void;
  trxDetails: CheckoutTransaction;
  isUpdating: boolean;
};

const BuyInformation: React.FC<screen> = ({
  changeScreen,
  updateTrxById,
  trxDetails,
  isUpdating,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutTransaction>({});

  //   Country
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countryFlags[0] ?? { countryCode: 0, flag: "", name: "Unknown" },
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getFlagSrc = (flag: Country["flag"]) =>
    typeof flag === "string" ? flag : flag.src;
  const isAnyDrawerOpen = drawerOpen;

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [dobError, setDobError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // only digits
    if (value.length > 2) value = value.slice(0, 2); // limit to 2 digits
    setDay(value);
  };

  const handleChangeMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // only digits
    if (value.length > 2) value = value.slice(0, 2); // limit to 2 digits
    setMonth(value);
  };

  const handleChangeYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // only digits
    if (value.length > 4) value = value.slice(0, 4); // limit to 2 digits
    setYear(value);
  };

  const isValidDate = (d: string, m: string, y: string) => {
    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    const yearNum = parseInt(y, 10);

    if (!dayNum || !monthNum || !yearNum) return false;
    if (monthNum < 1 || monthNum > 12) return false;

    const maxDays = new Date(yearNum, monthNum, 0).getDate(); // last day of the month
    if (dayNum < 1 || dayNum > maxDays) return false;

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();

    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  };

  const onSubmit = (data: CheckoutTransaction) => {
    if (!isValidDate(day, month, year)) {
      setDobError("Please enter a valid date (18+ years old)");
      return;
    }

    setDobError(""); // clear previous errors

    const dob = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;

    const reqBody = {
      ...data,
      dob,
      screen: "screen5",
    };

    void updateTrxById(reqBody);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isAnyDrawerOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-10 bg-black opacity-50"
          onClick={() => {
            setDrawerOpen(false);
          }}
        />
      )}
      <div className="relative flex h-screen w-full flex-col overflow-hidden rounded-lg bg-white p-6 text-black shadow-lg md:h-[625px] md:w-[535px]">
        {/* Back Arrow */}
        <div>
          <button
            type="button"
            className="rounded-full bg-[#f4f4f4] p-2 "
            onClick={() => changeScreen("screen3")}
          >
            <Image src={Back} alt="back" width={18} height={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col ">
          {/* Headings */}
          <div className="pt-5">
            <h2 className="text-[25px] font-bold">Your information</h2>
          </div>

          {/* Email Field */}
          <div className="flex w-full justify-between gap-3 pt-6">
            <InputField
              placeholder=""
              name="firstName"
              control={control}
              errors={errors}
              label="First name"
              rules={{
                required: "First name is required",
              }}
            />
            <InputField
              name="lastName"
              placeholder=""
              control={control}
              rules={{
                required: "Last name is required",
              }}
              label="Last name"
              errors={errors}
            />
          </div>
        </div>

        <div className="pt-6">
          <Typography
            sx={{
              fontFamily: "Manrope, sans-serif",
              fontWeight: "bold",
              fontSize: "12px",
              mb: 1,
            }}
          >
            Date of birth
          </Typography>

          <Grid container spacing={1}>
            <Grid item xs={4}>
              <TextField
                placeholder="DD"
                variant="outlined"
                fullWidth
                size="small"
                value={day}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  style: {
                    textAlign: "center",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    fontFamily: "Manrope, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    "& fieldset": {
                      borderColor: "#E5E7EB",
                      border: "1px solid #E5E7EB",
                    },
                    "&:hover fieldset": {
                      borderColor: "#E5E7EB",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#E5E7EB",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                placeholder="MM"
                variant="outlined"
                fullWidth
                size="small"
                value={month}
                onChange={handleChangeMonth}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  style: {
                    textAlign: "center",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    fontFamily: "Manrope, sans-serif",
                    "& fieldset": {
                      borderColor: "#E5E7EB",
                      border: "1px solid #E5E7EB",
                    },
                    "&:hover fieldset": {
                      borderColor: "#E5E7EB",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#E5E7EB",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                placeholder="YYYY"
                variant="outlined"
                fullWidth
                size="small"
                value={year}
                onChange={handleChangeYear}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  style: {
                    textAlign: "center",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    fontFamily: "Manrope, sans-serif",
                    "& fieldset": {
                      borderColor: "#E5E7EB",
                      border: "1px solid #E5E7EB",
                    },
                    "&:hover fieldset": {
                      borderColor: "#E5E7EB",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#E5E7EB",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
          {dobError && (
            <Typography color="error" sx={{ fontSize: "12px", mt: 1 }}>
              {dobError}
            </Typography>
          )}
        </div>

        <div className="pt-6">
          <InputField
            name="customerCountry"
            control={control}
            label="Country"
            placeholder=""
            errors={errors}
          />
        </div>
        <div className="pt-6">
          <InputField
            name="customerAddress"
            control={control}
            rules={{
              required: "Address is required",
            }}
            label="Address"
            placeholder=""
            errors={errors}
          />
        </div>

        <div className="flex w-full justify-between gap-3 pt-6">
          <InputField
            name="customerCity"
            control={control}
            errors={errors}
            rules={{
              required: "City is required",
            }}
            label="City"
            placeholder=""
          />
          <InputField
            name="customerZipcode"
            control={control}
            rules={{
              required: "Zip is required",
            }}
            type="number"
            label="Zip"
            placeholder=""
            errors={errors}
          />
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Continue Button at Bottom */}
        <ButtonField
          loading={isUpdating}
          disabled={isUpdating}
          icon={ArrowRight}
          type="submit"
        >
          Continue
        </ButtonField>

        <CurrencyDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedItem={selectedCountry}
          onSelect={(item) => setSelectedCountry(item as Country)}
          itemList={countryFlags}
          title="Select Country"
        />
      </div>
    </form>
  );
};

export default BuyInformation;
