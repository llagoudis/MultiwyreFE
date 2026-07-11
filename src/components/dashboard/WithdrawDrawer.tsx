import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  IconButton,
  Autocomplete,
  TextField,
  InputAdornment
} from "@mui/material";
import { MdClose } from "react-icons/md";
import Image from "next/image";
import { coinForKrakenName } from "~/helpers/helper";
import wallet from '../../assets/images/wallet-image.png';

interface WithdrawDrawerProps {
  open: boolean;
  onClose: () => void;
  assets: any[];
  onAddWhitelist: () => void;
}

const WithdrawDrawer: React.FC<WithdrawDrawerProps> = ({ open, onClose, assets, onAddWhitelist }) => {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [sendToType, setSendToType] = useState<"whitelist" | "new">("whitelist");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (assets && assets.length > 0 && !selectedAsset) {
      const btcAsset = assets.find(a => a.name?.toLowerCase().includes('bitcoin') || a.assetId?.toLowerCase() === 'btc');
      setSelectedAsset(btcAsset || assets[0]);
    }
  }, [assets, selectedAsset]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "500px", md: "650px" },
          padding: "20px",
          backgroundColor: "#fff",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.05)"
        }
      }}
      ModalProps={{
        sx: { "& .MuiBackdrop-root": { backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.15)" } }
      }}
    >
      <div className="flex flex-col h-full font-sans">
        {/* Header */}
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-3xl font-bold text-[#1A1C1E]">Withdraw</h2>
          <IconButton onClick={onClose} size="small" sx={{ border: "1px solid #E5E7EB", color: "#606060" }}>
            <MdClose size={18} />
          </IconButton>
        </div>
        <p className="text-[#606060] text-sm mb-4 opacity-80 leading-relaxed">
          Withdraw selected asset to crypto address or withdraw fiat to bank account.
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
          {/* Balance Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#606060]">Balance</label>
            <Autocomplete
              options={assets}
              getOptionLabel={(o) => o.icon || " " || o.name || ""}
              value={selectedAsset || null}
              onChange={(_, v) => setSelectedAsset(v)}
              disableClearable
              renderInput={(params) => (
                <TextField {...params} sx={autocompleteStyles}
                  InputProps={{
                    ...params.InputProps, startAdornment: selectedAsset && (
                      <InputAdornment position="start"><Image src={selectedAsset.icon || ""} alt="" width={20} height={20} /></InputAdornment>
                    )
                  }}
                />
              )}
            />
          </div>

          {/* Amount Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-[#606060]">Amount</label>
              <span className="text-[10px] text-[#8B8D91] font-medium">Limit 0.015 - 9.444098 Bitcoin</span>
            </div>
            <div className="relative flex items-center bg-[#F6F6FB] rounded-md px-4 py-2 border border-[#4C7FFF1F] focus-within:border-[#4775F2] transition-all">
              <input
                type="number"
                placeholder="Enter Amount"
                className="bg-transparent flex-1 outline-none text-base font-medium text-[#1A1C1E] placeholder:text-gray-400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <span className="font-medium text-[#8B8D91] text-sm uppercase">{coinForKrakenName(selectedAsset?.assetId || "")}</span>
                <button
                  onClick={() => setAmount(selectedAsset?.balance || "0")}
                  className="bg-primary-gradient text-white text-[10px] font-bold px-3 py-1.5 rounded-md hover:bg-[#91378e] transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Send To Toggle */}
          <div className="">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-[#606060]">Send to</label>
              <IconButton size="small"><Image src="/assets/general/exclamatory.svg" alt="" width={14} height={14} /></IconButton>
            </div>
            <div className="flex p-1 bg-[#F4F6F9] rounded-md">
              <button
                onClick={() => setSendToType("whitelist")}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${sendToType === "whitelist" ? "bg-white text-[#1A1C1E] shadow-sm" : "text-[#8B8D91]"}`}
              >
                White list addres
              </button>
              <button
                onClick={() => setSendToType("new")}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${sendToType === "new" ? "bg-white text-[#1A1C1E] shadow-sm" : "text-[#8B8D91]"}`}
              >
                New Address
              </button>
            </div>
          </div>

          {/* Empty State */}
          <div className="py-6 flex flex-col w-full items-center justify-center text-center space-y-1">
            <div className="relative">
              <Image src={wallet} alt="" width={150} height={150} className="object-contain" />
            </div>
            <div className="space-y-1 w-full">
              <p className="font-bold text-[#1A1C1E] ">There are no whitelist addresses here</p>
              <p className=" text-[#606060] max-w-[90%] text-sm  mx-auto opacity-70 leading-relaxed">
                Add trusted address to withdraw assets without confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={onAddWhitelist}
            className="w-full border border-[#4F7AF9] text-[#4F7AF9] py-3 rounded-md font-bold text-sm transition-all hover:bg-blue-50"
          >
            Add address to whitelist
          </button>
          <button
            disabled
            className="w-full bg-[#F4F6F9] text-[#8B8D91] py-3 rounded-md font-bold text-sm opacity-60"
          >
            Create Order
          </button>
        </div>
      </div>
    </Drawer>
  );
};

const autocompleteStyles = {
  "& .MuiOutlinedInput-root": {
    height: "48px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#4775F2" },
    "&.Mui-focused fieldset": { borderColor: "#4775F2", borderWidth: "1px" },
  }
};

export default WithdrawDrawer;
