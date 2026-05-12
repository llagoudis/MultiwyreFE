import {Fragment, useCallback, useState} from "react";
import Image, {type StaticImageData} from "next/image";
import Link from "next/link";
import arrowUp from "../../assets/general/send_money.svg";
import arrowDown from "../../assets/general/receive_money.svg";
import transfer from "../../assets/general/transfer_money.svg";
import qrScanner from "../../assets/general/qr_code_scanner.svg";
import {euroFormat, maskAddress} from "~/helpers/helper";
import {Dialog, Snackbar} from "@mui/material";
import Copy from "~/assets/general/copy.svg";

type imageType = StaticImageData;

interface WalletCardProps {
  walletDetails: DashboardAssetType;
  currency?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({walletDetails, currency}) => {
  const [openqr, setOpen] = useState(false);
  const [messagePopup, setMessagePopup] = useState(false);
  const openQR = () => setOpen(true);
  const closeQR = () => setOpen(false);
  // const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

  const onCopy = () => {
    if (walletDetails.assetAddress) {
      navigator.clipboard
        .writeText(walletDetails.assetAddress)
        .then(() => setMessagePopup(true))
        .catch((error) => console.error("Clipboard operation failed:", error));
    }
  };

  return (
    <Fragment>
      <Snackbar
        open={messagePopup}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
        onClose={() => setMessagePopup(false)}
        autoHideDuration={1000}
        message="Copied to clipboard"
      />
      {!!walletDetails.qrImage && (
        <Dialog
          open={openqr}
          onClose={closeQR}
          fullWidth
          sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                width: "auto",
                maxWidth: "750px",
              },
            },
          }}
        >
          <div className=" h-full w-full rounded p-8 md:h-[35vh]">
            <div className="flex h-full w-full flex-col items-center md:flex-row">
              <Image
                className=" aspect-square w-40"
                alt="qr code"
                src={walletDetails.qrImage ?? ""}
                width={20}
                height={20}
              />
              <div className="flex flex-col items-center justify-center gap-2 md:items-start md:justify-start ">
                <p className=" text-xl font-bold">Wallet address</p>
                <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-start">
                  <p className=" break-all text-center font-medium sm:break-normal sm:text-start">
                    {walletDetails.assetAddress}
                  </p>
                  <Image
                    onClick={onCopy}
                    className="cursor-pointer"
                    src={Copy as StaticImageData}
                    alt="Copy"
                  />
                </div>

                <button
                  onClick={closeQR}
                  className=" cursor-pointer text-sm"
                >
                  <p className=" text-base font-bold text-[#C1922E]">Go back</p>
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Updated Card Design */}
      <div
        key={walletDetails.id}
        className="rounded-sm bg-white p-4"
        style={{
          border: "1px solid blue",
          borderRadius: "5px"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              className="aspect-square h-10 w-10"
              src={walletDetails.icon ?? ""}
              width={15}
              height={15}
              alt="Icon"
            />
            <p className="font-medium">{walletDetails.name}</p>
            <p className="text-2xl font-bold">
              {Number(walletDetails.balance)
                ? Number(walletDetails.balance)?.toFixed(6)
                : 0}
            </p>
          </div>

          <div className="flex gap-2">


            {/* Receive Icon - opens QR dialog */}
            <button onClick={() => {
              console.log(walletDetails.qrImage);
              setOpen(true);
            }} className="cursor-pointer p-3 text-sm  border-4 border-blue-500 rounded-lg">
              <Image alt="" src={arrowDown as imageType}/>
            </button>
            {/* Send Icon */}
            <Link href={`./transfers/?from=${walletDetails.assetId}&type=send`}>
              <button className="cursor-pointer p-3 text-sm border-4  border-blue-500 bg-blue-500 rounded-lg">
                <Image alt="" src={arrowUp as imageType}/>
              </button>
            </Link>


            {/* Transfer Icon */}
            <Link href={`./exchange`}>
              <button className="cursor-pointer p-3 text-sm  border-4 border-blue-500 rounded-lg">
                <Image alt="" src={transfer as imageType}/>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default WalletCard;
