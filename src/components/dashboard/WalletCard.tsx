import { Fragment, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Copy from "~/assets/general/copy.svg";
import { Dialog, Snackbar } from "@mui/material";
import { DownloadIcon, ExchangeIcon, UploadIcon } from "~/assets/svgs";

interface WalletCardProps {
  walletDetails: DashboardAssetType;
  currency?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ walletDetails, currency }) => {
  const [openqr, setOpen] = useState(false);
  const [messagePopup, setMessagePopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const closeQR = () => setOpen(false);

  const onCopy = () => {
    if (walletDetails.assetAddress) {
      navigator.clipboard
        .writeText(walletDetails.assetAddress)
        .then(() => setMessagePopup(true))
        .catch((error) => console.error("Clipboard operation failed:", error));
    }
  };

  const name = walletDetails.name.toLowerCase();
  const isEuro = name.includes('eiro') || name.includes('euro');
  const isBtc = name.includes('bitcoin');
  const isUsdt = name.includes('usdt');
  const isEth = name.includes('eth');
  const isUsdc = name.includes('usdc');

  const isTRC = name.includes('trc');
  const isBSC = name.includes('bsc');
  const isPolygon = name.includes('polygon');

  const getBgColor = () => {
    if (isEuro) return 'bg-[#4775F2]';
    if (isBtc) return 'bg-[#F7931A]';
    if (isUsdt) return 'bg-[#26A17B]';
    if (isEth) return 'bg-[#627EEA]';
    if (isUsdc) return 'bg-[#2775CA]';
    return 'bg-gray-200';
  };

  return (
    <Fragment>
      <Snackbar
        open={messagePopup}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setMessagePopup(false)}
        autoHideDuration={1000}
        message="Copied to clipboard"
      />
      {!!walletDetails.qrImage && (
        <Dialog open={openqr} onClose={closeQR} fullWidth>
          <div className=" h-full w-full rounded p-8 md:h-[35vh]">
            <div className="flex h-full w-full flex-col items-center md:flex-row gap-6">
              <Image className=" aspect-square w-40" alt="qr code" src={walletDetails.qrImage ?? ""} width={160} height={160} />
              <div className="flex flex-col items-center justify-center gap-2 md:items-start md:justify-start ">
                <p className=" text-xl font-bold">Wallet address</p>
                <div className="flex items-center gap-2">
                  <p className=" break-all font-medium">{walletDetails.assetAddress}</p>
                  <Image onClick={onCopy} className="cursor-pointer" src={Copy as StaticImageData} alt="Copy" />
                </div>
                <button onClick={closeQR} className=" mt-4 text-[#4775F2] font-bold">Go back</button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative rounded-lg bg-white p-4 transition-all duration-300 border h-[80px] flex items-center ${isHovered ? 'border-[#4775F2] shadow-[0px_4px_12px_rgba(71,117,242,0.1)]' : 'border-gray-200'}`}
      >
        <div className="flex items-center  justify-between w-full">
          <div className="flex items-center gap-4  flex-1">
            {/* Square icon background with network badge */}
            <div className="relative flex-shrink-0">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg shadow-sm ${getBgColor()}`}>
                {/* Removed filters to fix icon visibility */}
                <Image className="h-7 w-7 object-contain" src={walletDetails.icon ?? ""} width={28} height={28} alt={walletDetails.name} />
              </div>

              {/* {isTRC && (
                <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                   <div className="h-2.5 w-2.5 rounded-full bg-[#EF0027]"></div>
                </div>
              )}
              {isBSC && (
                <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                   <div className="h-2.5 w-2.5 rounded-full bg-[#F3BA2F]"></div>
                </div>
              )}
              {isPolygon && (
                <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                   <div className="h-2.5 w-2.5 rounded-full bg-[#8247E5]"></div>
                </div>
              )} */}
            </div>

            <div className="flex flex-col w-full ">
              <div className="flex items-center justify-between  flex-1 gap-3">
                <p className="text-lg  text-[#424242] whitespace-nowrap">{walletDetails.name}</p>

                {/* Smooth hover buttons - only appear on hover */}
                <div className={`flex gap-1.5 transition-all duration-300 ease-in-out ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                    className="group flex h-9 w-9 items-center justify-center rounded-md border border-[#4775F2] bg-white hover:bg-[#4775F2] transition-all duration-200"
                  >
                    <DownloadIcon className="text-[#4775F2] group-hover:text-white transition-colors" />
                  </button>
                  <Link href={`./transfers/?from=${walletDetails.assetId}&type=send`} onClick={(e) => e.stopPropagation()}>
                    <div className="group flex h-9 w-9 items-center justify-center rounded-md border border-[#4775F2] bg-white hover:bg-[#4775F2] transition-all duration-200"
                    >
                      <UploadIcon className="text-[#4775F2] group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                  <Link href={`./exchange`} onClick={(e) => e.stopPropagation()}>
                    <div className="group flex h-9 w-9 items-center justify-center rounded-md border border-[#4775F2] bg-white hover:bg-[#4775F2] transition-all duration-200">
                      <ExchangeIcon className="text-[#4775F2] group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex flex-col min-w-4  items-end transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-lg font-semibold text-[#1A1C1E]">
              {Number(walletDetails.balance) ? Number(walletDetails.balance).toLocaleString() : 0}
            </p>
            <p className="text-xs font-medium text-[#8B8D91]">1</p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default WalletCard;
