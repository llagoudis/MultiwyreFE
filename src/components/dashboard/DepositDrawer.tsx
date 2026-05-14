import React, { useState, useEffect } from "react";
import {
  Drawer,
  IconButton,
  Autocomplete,
  TextField,
  InputAdornment,
  Snackbar
} from "@mui/material";
import { MdClose, MdContentCopy } from "react-icons/md";
import Image from "next/image";
import { coinForKrakenName } from "~/helpers/helper";

interface DepositDrawerProps {
  open: boolean;
  onClose: () => void;
  assets: any[];
}

const DepositDrawer: React.FC<DepositDrawerProps> = ({ open, onClose, assets }) => {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (assets && assets.length > 0 && !selectedAsset) {
      const btcAsset = assets.find(a => a.name?.toLowerCase().includes('bitcoin') || a.assetId?.toLowerCase() === 'btc');
      setSelectedAsset(btcAsset || assets[0]);
    }
  }, [assets, selectedAsset]);

  const handleCopy = () => {
    if (selectedAsset?.assetAddress) {
      navigator.clipboard.writeText(selectedAsset.assetAddress);
      setCopySuccess(true);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "650px" },
            padding: "20px",
            backgroundColor: "#fff",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.05)"
          }
        }}
        ModalProps={{
          sx: {
            "& .MuiBackdrop-root": {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0,0,0,0.2)"
            }
          }
        }}
      >
        <div className="flex flex-col h-full relative">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1C1E]">Deposit</h2>
            <IconButton onClick={onClose} size="small" sx={{ color: "#8B8D91", border: "1px solid #E5E7EB" }}>
              <MdClose size={20} />
            </IconButton>
          </div>

          <p className="text-[#606060] text-sm sm:text-base mb-8 leading-relaxed">
            To top up your account balance, select the preferred currency and follow the instructions.
          </p>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scroll">
            <div className="space-y-6 pb-5">
              {/* Balance Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm sm:text-base font-bold text-[#1A1C1E]">Balance</label>
                  <span className="text-[10px] sm:text-xs text-[#8B8D91]">Min limit: 0.01</span>
                </div>
                <Autocomplete
                  options={assets}
                  getOptionLabel={(option) => option.name || ""}
                  value={selectedAsset}
                  onChange={(_, newValue) => setSelectedAsset(newValue)}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: "56px",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          "& fieldset": { borderColor: "#E5E7EB" },
                          "&:hover fieldset": { borderColor: "#4775F2" },
                          "&.Mui-focused fieldset": { borderColor: "#4775F2", borderWidth: "1px" },
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: selectedAsset && (
                          <InputAdornment position="start">
                            <Image src={selectedAsset.icon || ""} alt="" width={24} height={24} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} className="flex items-center gap-3 p-3">
                      <Image src={option.icon || ""} alt="" width={24} height={24} />
                      <span className="font-medium">{option.name}</span>
                    </li>
                  )}
                />
              </div>

              {/* QR Code Section */}
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-bold text-[#1A1C1E]">Scan QR Code</p>
                <div className="flex justify-center py-2 sm:py-4">
                  <div className="p-3 sm:p-4 rounded-2xl border border-pink-100 bg-white shadow-sm">
                    {selectedAsset?.qrImage ? (
                      <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]">
                        <Image
                          src={selectedAsset.qrImage}
                          alt="QR Code"
                          fill
                          className="rounded-lg object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] bg-gray-50 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs">
                        No QR Code available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-bold text-[#1A1C1E]">Your wallet address</p>
                <TextField
                  fullWidth
                  value={selectedAsset?.assetAddress || "No address available"}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopy} size="small">
                          <MdContentCopy size={18} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: { xs: "48px", sm: "56px" },
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      fontSize: { xs: "12px", sm: "14px" },
                      "& fieldset": { borderColor: "#E5E7EB" },
                    }
                  }}
                />
              </div>

              {/* Warning Message */}
              <div className="mt-8 p-3 rounded-lg border border-[#C9C9C9] bg-white">
                <div className="flex gap-2 items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B8D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs leading-relaxed text-[#606060]">
                      Send only <span className="font-bold text-[#606060] uppercase">{coinForKrakenName(selectedAsset?.assetId || "")}</span> to this deposit address.
                    </p>
                    <p className="text-[10px] sm:text-xs leading-relaxed text-[#606060]">
                      This address does not support deposit of any other coins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Address copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default DepositDrawer;
