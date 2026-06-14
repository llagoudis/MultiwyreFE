import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
        <Dialog open={openqr} onClose={closeQR} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16 } }}>
          <div className="flex flex-col items-center px-6 py-6 gap-5">
            {/* Header */}
            <div className="flex w-full items-center justify-between">
              <p className="text-lg font-semibold text-[#1A1C1E]">Wallet Address</p>
              <button
                onClick={closeQR}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* QR Code with blue border */}
            <div className="rounded-xl border-2 border-[#4775F2] p-3">
              <Image className="aspect-square" alt="qr code" src={walletDetails.qrImage ?? ""} width={180} height={180} />
            </div>

            {/* Wallet address */}
            <p className="break-all text-center text-sm text-[#424242]">{walletDetails.assetAddress}</p>

            {/* Buttons */}
            <div className="flex w-full flex-col gap-3">
              <button
                onClick={onCopy}
                className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #4775F2 0%, #C850C0 100%)" }}
              >
                Copy Wallet Address
              </button>
              <button
                onClick={closeQR}
                className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-[#1A1C1E] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog>
      )}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative rounded-lg bg-white px-3 py-2 transition-all duration-300 border  flex items-center ${isHovered ? 'border-[#4775F2] shadow-[0px_4px_12px_rgba(71,117,242,0.1)]' : 'border-gray-200'}`}
      >
        <div className="flex items-center  justify-between w-full">
          <div className="flex items-center gap-4  flex-1">
            {/* Square icon background with network badge */}
            <div className="relative flex-shrink-0">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${getBgColor()}`}>
                {/* Removed filters to fix icon visibility */}
                <Image className="h-6 w-6 object-contain" src={walletDetails.icon ?? ""} width={28} height={28} alt={walletDetails.name} />
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

            <div className="flex flex-col w-full min-w-0">
              <div className="flex items-center justify-between flex-1 gap-2 md:gap-3">
                <p className="text-base md:text-lg text-[#424242] whitespace-nowrap truncate">{walletDetails.name}</p>

                {/* Smooth hover buttons - always visible on mobile, hover on desktop */}
                <div className={`flex gap-1.5 transition-all duration-300 ease-in-out md:translate-x-0 ${isHovered ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:-translate-x-2 md:pointer-events-none opacity-100'}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                    className="group flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-[#4775F2] bg-white hover:bg-[#4775F2] transition-all duration-200 flex-shrink-0"
                  >
                    <DownloadIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4775F2] group-hover:text-white transition-colors" />
                  </button>
                  <Link href={`./transfers/?from=${walletDetails.assetId}&type=send`} onClick={(e) => e.stopPropagation()}>
                    <div className="group flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-[#4775F2] bg-white hover:bg-[#4775F2] transition-all duration-200 flex-shrink-0">
                      <UploadIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4775F2] group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                  <Link href={`./exchange`} onClick={(e) => e.stopPropagation()}>
                    <div className="group flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-[#4775F2] bg-white hover:bg-[#4775F2] transition-all duration-200 flex-shrink-0">
                      <ExchangeIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4775F2] group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex flex-col  items-end transition-opacity duration-300 ${isHovered ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'} hidden sm:flex`}>
            <p className="text-base md:text-lg font-semibold text-black">
              {Number(walletDetails.balance) ? Number(walletDetails.balance).toLocaleString() : 0}
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default WalletCard;
