import { TextField } from "@mui/material";
import { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import Cancel from "~/assets/general/cancel.svg";

type SelectionItem = {
  name: string;
  flag: string | { src: string };
  countryCode?: number;
  currencyCode?: number;
  subname?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: SelectionItem) => void;
  selectedItem: SelectionItem;
  itemList: SelectionItem[];
  title: string;
};

const CurrencyDrawer = ({
  isOpen,
  onClose,
  onSelect,
  selectedItem,
  itemList,
  title,
}: Props) => {
  const [search, setSearch] = useState("");

  const getFlagSrc = (flag: SelectionItem["flag"]) =>
    typeof flag === "string" ? flag : flag.src;

  const filteredItems = itemList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const isSelected = (item: SelectionItem) => {
    if (item.countryCode && selectedItem.countryCode) {
      return item.countryCode === selectedItem.countryCode;
    }
    if (item.currencyCode && selectedItem.currencyCode) {
      return item.currencyCode === selectedItem.currencyCode;
    }
    return false;
  };

  const getCodeLabel = (item: SelectionItem) =>
    item.currencyCode ?? item.countryCode;

  return (
    <div className="animate-slide-up absolute bottom-0 left-0 z-50 flex h-[380px] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl">
      <div className="flex items-center justify-between px-4 py-4 ">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <div>
          <img
            src={(Cancel as StaticImageData).src}
            alt="cancel"
            style={{ width: "20px", height: "auto" }}
            onClick={onClose}
          />
        </div>
      </div>

      <div className="p-4">
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          placeholder=""
          variant="outlined"
          InputLabelProps={{
            shrink:
              search.length > 0 ||
              search.length === 0 ||
              undefined, // Shrink if there's a value
            sx: {
              fontFamily: "Manrope, sans-serif", // ✅ Label font
              fontWeight: "bold",
              color: "#000",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
                height: 48,
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
            "& label.Mui-focused": {
              fontWeight: "bold",
              color: "#000",
            },
            "& label": {
              fontWeight: "semibold",
              color: "#000",
            },
          }}
        />
      </div>

      <div className=" px-4 pb-4 ">
        <p className="mb-2 text-sm text-gray-500">
          Available via selected method
        </p>
        <div className="overflow-y-scroll m-2 max-h-[200px] custom-scroll">

        {filteredItems.map((item) => (
          <div
          key={getCodeLabel(item)}
          className={`flex cursor-pointer items-center justify-between rounded px-2 py-2 hover:bg-[#FBFBFB] transition ${
            isSelected(item) ? "bg-[#FBFBFB]" : ""
          }`}
          onClick={() => {
            onSelect(item);
            onClose();
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src={getFlagSrc(item.flag)}
              alt={item.name}
              className="h-5 w-5 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{item.subname}</p>
            </div>
          </div>
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
              isSelected(item) ? "border-[#3B00E7]" : "border-gray-300"
            }`}
          >
            {isSelected(item) && (
              <div className="h-2 w-2 rounded-full bg-[#3B00E7]"></div>
            )}
          </div>
        </div>
        
        ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyDrawer;
