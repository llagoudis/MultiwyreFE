import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  Autocomplete,
  TextField,
  InputAdornment
} from "@mui/material";
import { MdClose } from "react-icons/md";
import Image from "next/image";
import whitelIstAddress from "../../assets/images/whitelist-address.png"

interface AddWhitelistDrawerProps {
  open: boolean;
  onClose: () => void;
  assets: any[];
}

const AddWhitelistDrawer: React.FC<AddWhitelistDrawerProps> = ({ open, onClose, assets }) => {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");

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
          <h2 className="text-3xl font-bold text-[#1A1C1E]">Add address to white list</h2>
          <IconButton onClick={onClose} size="small" sx={{ border: "1px solid #E5E7EB", color: "#606060" }}>
            <MdClose size={18} />
          </IconButton>
        </div>
        <p className="text-[#606060] text-sm mb-4 opacity-80 leading-relaxed max-w-[90%]">
          Initial setup to full implementation, guiding you through every step for seamless.
        </p>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scroll">
          {/* Currency Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#606060]">Currency</label>
            <Autocomplete
              options={assets}
              getOptionLabel={(o) => o.name || ""}
              value={selectedAsset || null}
              onChange={(_, v) => setSelectedAsset(v)}
              disableClearable
              renderInput={(params) => (
                <TextField {...params} sx={autocompleteStyles} placeholder="Select Currency"
                  InputProps={{
                    ...params.InputProps, startAdornment: selectedAsset && (
                      <InputAdornment position="start"><Image src={selectedAsset.icon || ""} alt="" width={20} height={20} /></InputAdornment>
                    )
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1A1C1E]">Add withdrawal address</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#606060]">Withdrawal address *</label>
              <TextField
                fullWidth
                placeholder="Withdrawal address *"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={textFieldStyles}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#606060]">Address label *</label>
              <TextField
                fullWidth
                placeholder="Add lebel address"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                sx={textFieldStyles}
              />
            </div>
          </div>

          {/* Empty State */}
          <div className="py-0 flex flex-col w-full items-center justify-center text-center space-y-1">
            <div className="relative ">
              <Image src={whitelIstAddress} alt="" width={180} height={180} className="object-contain" />
            </div>
            <div className="space-y-1 w-full">
              <p className="font-bold text-[#1A1C1E] text-lg">No whitelisted addresses yet</p>
              <p className=" text-[#606060] max-w-[90%] mx-auto opacity-70 leading-relaxed">
                Add your first withdrawl address to get started
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            className="w-full bg-[#F4F6F9] text-[#8B8D91] py-3 rounded-md font-bold text-base transition-all hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </Drawer>
  );
};

const autocompleteStyles = {
  "& .MuiOutlinedInput-root": {
    height: "44px",
    borderRadius: "6px",
    backgroundColor: "#F7F9FC",
    fontSize: "14px",
    fontWeight: 500,
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: "#E5E7EB" },
    "&.Mui-focused fieldset": { borderColor: "#4775F2", borderWidth: "1px" },
  }
};

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    height: "44px",
    borderRadius: "6px",
    backgroundColor: "#fff",
    fontSize: "14px",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#4775F2" },
    "&.Mui-focused fieldset": { borderColor: "#4775F2" },
  }
};

export default AddWhitelistDrawer;
