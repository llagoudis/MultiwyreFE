import React, { useEffect, useState } from "react";

// import { IconButton, InputAdornment, TextField } from "@mui/material";
import MuiButton from "../MuiButton";
// import { FiCopy } from "react-icons/fi";
import { Dialog } from "@headlessui/react";

type propType = {
  onClose: () => void;
  invoice?: Invoices;
  openAdd: string;
};

const InvoiceCreated = (props: propType) => {
  const [openAdd, setOpenAdd] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [invoices, setInvoices] = useState<Invoices[]>([]);

  // const fetchInvoices = async () => {
  //   setLoading(true);
  //   const [data]: APIResult<Invoices[]> = await ApiHandler(getInvoices);
  //   setLoading(false);

  //   if (data?.success) {
  //     setInvoices(data.body);
  //   } else {
  //     toast.error("Failed to load Invoices");
  //   }
  // };

  // useEffect(() => {
  //   void fetchInvoices();
  // }, []);

  // console.log("invoices", invoices);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  useEffect(() => {
    // reset({
    //   ...props.recurringFees,
    //   status: props.recurringFees.status ? "active" : "inactive",
    // });
  }, [props]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      console.log("Copied:", value);
    } catch (error) {
      console.error("Error copying:", error);
    }
  };

  const path = window.location.href;

  return (
    <Dialog
      open={true}
      onClose={() => {
        props.onClose();
      }}
    >
      <div className="fixed inset-0 z-[9999] m-auto h-fit w-fit overflow-y-auto rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="flex min-h-full items-center justify-center">
          <div className="w-auto rounded-xl bg-white px-8 py-4">
            <div className="my-4 flex w-[90vw] flex-col gap-8 p-3 lg:w-[35vw]">
              <p className=" text-center text-2xl font-semibold">
                The Invoice Has Been Created
              </p>

              {/* <p className="py-2 font-medium">
                The invoice for creating 1000 USDT has been created. You can
                share the link below with the user.
              </p> */}

              {/* <p className="font-medium"> Link</p>

              <TextField
                size="small"
                value={path}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleCopy(path)} edge="end">
                        <FiCopy />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              /> */}
              <div className=" flex justify-center  ">
                <MuiButton
                  onClick={() => {
                    props.onClose();
                  }}
                  name="Done"
                  className=""
                ></MuiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InvoiceCreated;
