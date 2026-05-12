import { Dialog } from "@mui/material";
import React from "react";
import ChangeEmail from "./ChangeEmail";
import ChangeMobile from "./ChangeMobile";

type props = {
  open: string;
  handleClose: () => void;
};

const ChangeAuth = ({ open, handleClose }: props) => {
  return (
    <Dialog
      maxWidth={"xs"}
      fullWidth
      open={open ? true : false}
      onClose={handleClose}
    >
      <div className=" rounded p-4">
        {open === "email" ? (
          <ChangeEmail handleClose={handleClose} />
        ) : open === "sms" ? (
          <ChangeMobile handleClose={handleClose} />
        ) : (
          ""
        )}
      </div>
    </Dialog>
  );
};

export default ChangeAuth;
