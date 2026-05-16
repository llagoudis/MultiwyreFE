import React, { useEffect, useState } from "react";
import InvoicesTable from "./InvoicesTable";
import { InputAdornment, TextField } from "@mui/material";
import MuiButton from "../MuiButton";
import AddInvoice from "./AddInvoice";
import InvoiceCreated from "./InvoiceCreated";
import SearchIcon from "../../assets/general/search_svg.svg";
import Image from "next/image";
import localStorageService from "~/service/LocalstorageService";

const Invoices = () => {
  const [openAdd, setOpenAdd] = useState<string>("");
  const [invoiceUpdated, setInvoiceUpdated] = useState<boolean>(false);
  const [veiwer, setVeiwer] = useState<any>("");

  useEffect(() => {
    const authBody = localStorageService.decodeAuthBody();
    if (authBody?.roles === "ex_user_viewer") {
      setVeiwer(authBody?.roles);
    }
  }, []);

  const handleInvoiceCreated = (value: any) => {
    if (value === "success") {
      setInvoiceUpdated(!invoiceUpdated);
      setOpenAdd(value);
    } else {
      setOpenAdd("");
    }
  };

  return (
    <div className="w-full mx-auto ">
      <div className="w-full bg-white rounded-3xl  shadow-sm border border-gray-100 min-h-[800px]">
        <div className="flex items-center border-b p-4 justify-between ">
          <h1 className="text-2xl font-bold text-[#1A1C1E]">Invoices</h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <TextField
                placeholder="Search"
                size="small"
                sx={{
                  width: "400px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "4px",
                    height: "45px",
                    backgroundColor: "#FFFFFF",
                    "& fieldset": { borderColor: "#E2E8F0" },
                    "&:hover fieldset": { borderColor: "#4775F2" },
                    "&.Mui-focused fieldset": { borderColor: "#4775F2" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image src={SearchIcon} alt="search" className="opacity-50" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            {!veiwer && (
              <button
                onClick={() => setOpenAdd("addNew")}
                className="bg-primary-gradient text-white px-6 py-2 rounded-md font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="text-lg">+</span> New Invoices
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <InvoicesTable invoiceUpdated={invoiceUpdated} />
        </div>
      </div>

      {openAdd === "addNew" && (
        <AddInvoice
          onClose={handleInvoiceCreated}
          openAdd={openAdd}
          setInvoiceUpdated={setInvoiceUpdated}
        />
      )}

      {openAdd === "success" && (
        <InvoiceCreated
          onClose={() => {
            setOpenAdd("");
          }}
          openAdd={openAdd}
        />
      )}
    </div>
  );
};

export default Invoices;
