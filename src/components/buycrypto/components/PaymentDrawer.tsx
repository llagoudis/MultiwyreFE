import React, { useEffect } from "react";
import Image, { type StaticImageData } from "next/image";
import Cancel from "~/assets/general/cancel.svg";
import Background from "~/assets/general/Background.svg";

type PaymentMethod = {
  name: string;
  icons: string[];
  fee: string;
  available: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
  paymentMethods: PaymentMethod[];
  selected: string;
};

const PaymentDrawer = ({
  isOpen,
  onClose,
  onSelect,
  paymentMethods,
  selected,
}: Props) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="animate-slide-up absolute bottom-0 left-0 z-50 flex h-[380px] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-[15px] font-semibold">Payment Methods</h2>
        <Image
          src={Cancel.src}
          alt="cancel"
          width={20}
          height={20}
          onClick={onClose}
          className="cursor-pointer"
        />
      </div>

      {/* Scrollable List */}
      <div className="mt-5 flex justify-between gap-4 p-4">
        {paymentMethods.map((method) => {
          const isSelected = selected === method.name;
          const isAvailable = method.available;

          return (
            <span
              key={method.name}
              onClick={() => {
                if (isAvailable) {
                  onSelect(method.name);
                }
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-8 py-4 transition-all ${
                !isAvailable
                  ? "cursor-not-allowed opacity-50"
                  : isSelected
                    ? "border-1 border-[#4D00EC]"
                    : "border-1 border-[#E5E7EB]"
              }`}
            >
              {isSelected && isAvailable && (
                <Image
                  src={(Background as StaticImageData).src}
                  alt="Looping"
                  width={40}
                  height={40}
                  className="absolute right-[-6px] top-[-6px] h-4 w-4 text-purple-700"
                />
              )}

              <div className="flex h-10 items-center gap-1">
                {method.icons.map((icon, idx) => (
                  <div key={idx} className="flex">
                    <Image
                      src={icon}
                      width={100}
                      height={100}
                      alt={method.name}
                      className="object-fill"
                    />
                    {method.name === "Bank Transfer" && (
                      <span className="m-0  text-start text-xs font-medium">
                        {method.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <span
                className={`text-xs ${!isAvailable ? "text-gray-300" : "text-gray-500"}`}
              >
                Fee: {method.fee}
              </span>
              {!isAvailable && (
                <span className="absolute -top-2 right-0 rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-500">
                  Unavailable
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentDrawer;
