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
    const authBody = localStorageService.decodeAuthBody()
    if(authBody?.roles === "ex_user_viewer"){
      setVeiwer(authBody?.roles)
    }
  }, [])

  const handleInvoiceCreated = (value: any) => {
    if (value === "success") {
      setInvoiceUpdated(!invoiceUpdated);
      setOpenAdd(value);
    } else {
      setOpenAdd("");
    }
  };

  return (
    <div className="mt-10 flex flex-col justify-center gap-10 px-10">
      <div className="flex items-center justify-between">
        <p className="text-3xl font-medium">Invoices</p>

        <div className="flex items-center gap-4">
          <TextField
            placeholder="Search"
            size="small"
            sx={{ width: "40vw" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <Image src={SearchIcon} alt="search" />
                </InputAdornment>
              ),
            }}
          />
          {!veiwer && (
          <MuiButton
            onClick={() => setOpenAdd("addNew")}
            name="+ New Invoices"
          />
          )}
        </div>
      </div>

      <InvoicesTable invoiceUpdated={invoiceUpdated} />

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
