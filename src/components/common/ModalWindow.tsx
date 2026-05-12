import Image, { type StaticImageData } from "next/image";
import { ReactNode } from "react";
import cancel from "~/assets/general/close.svg";

interface WarningMsgProps {
  children?: ReactNode;
  title?: string;
  message?: string;
  errorMessage?: string;
  onClose?: () => void;
  onAction?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  element?: any;
  showCloseButtonInTitle?: boolean;
  onActionClickText?: string;
  onActionButtonType?: "button" | "submit";
}

type imageType = StaticImageData;

const ModalWindow: React.FC<WarningMsgProps> = ({
  children,
  title = "Window",
  message,
  errorMessage = "",
  onClose,
  onAction,
  element,
  showCloseButtonInTitle = false,
  onActionClickText = "OK",
  onActionButtonType = "button",
}) => {
  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="flex justify-between bg-gray-50 p-2">
              <h3
                className="text-base  font-semibold leading-6 text-gray-900"
                id="modal-title"
              >
                {title}
              </h3>
              {showCloseButtonInTitle && (
                <Image
                  src={cancel as StaticImageData}
                  alt="Close"
                  className="cursor-pointer"
                  onClick={onClose}
                />
              )}
            </div>
            <div className="bg-white px-4 pb-4 pt-4 sm:p-4 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                  </div>
                  {errorMessage && (
                    <div className="mt-2 rounded bg-red-100">
                      <p className="p-4 text-sm text-red-900">{errorMessage}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-0">{children}</div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {onAction && (
                <button
                  type={onActionButtonType}
                  className="inline-flex w-full justify-center rounded-md bg-gradient-to-r from-blue-500 to-purple-700px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 sm:ml-3 sm:w-auto"
                  onClick={(event) => onAction(event)}
                >
                  {onActionClickText}
                </button>
              )}
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-blue-800 hover:text-white sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWindow;
