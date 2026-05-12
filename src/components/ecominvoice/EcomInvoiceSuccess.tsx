import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import Image from 'next/image';
import Success from '../../assets/general/checked.png';
import Alert from '../../assets/general/alert.png';

type propType = {
    onClose: (value?: any) => void;
    invoice?: Invoices;
    openAdd: string;
    apiResponseData: any;
    statusData: any;
};

const EcomInvoiceSuccess = (props: propType) => {
    const { body } = props.apiResponseData ?? {};
    const { statusData } = props ?? {};
    console.log(body)
    console.log("body web hook response", statusData)
    const [timeLeft, setTimeLeft] = useState(30);
    const [socketAmount, setSocketAmount] = useState(false);
    const [bodyAmount, setBodyAmount] = useState(false);

    const successHandler = () => {
        if (statusData?.successRedirectURL) {
            window.location.href = statusData?.successRedirectURL;
        } else {
            window.location.href = body?.successRedirectURL;
        }
    };

    useEffect(() => {
        const amount = parseFloat(parseFloat(statusData?.amount).toFixed(6));
        const exactAmount = parseFloat(parseFloat(statusData?.exactAmount).toFixed(6));
    
        if (!isNaN(amount) && !isNaN(exactAmount) && amount < exactAmount) {
            setSocketAmount(true);
        } else {
            setSocketAmount(false);
        }
    }, [statusData]);

    useEffect(() => {
        const amount = parseFloat(body?.amount);
        const exactAmount = parseFloat(body?.exactAmount);
        if (!isNaN(amount) && !isNaN(exactAmount) && amount < exactAmount) {
            setBodyAmount(true);
        } else {
            setBodyAmount(false);
        }
    }, [body]);

    useEffect(() => {
        const timer = setTimeout(successHandler, 30000);

        const interval = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [body]);

    return (
        <>
            <Box className="flex h-full min-h-screen items-center justify-center bg-gray-100">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-gray-100">
                    <div className="relative w-[95%] md:w-[700px] h-[90vh] overflow-y-auto md:h-auto space-y-4 border bg-[#f9fcff] py-8 px-5 md:p-10 rounded-lg">
                        <div className="text-center">
                            {socketAmount || bodyAmount ? (
                               <Image
                               src={Alert}
                               alt="Exclamatory"
                               className="w-150 h-150 ml-auto"
                           /> 
                            ) : (
                                <Image
                                src={Success}
                                alt="Success"
                                className="w-150 h-150 ml-auto"
                            />  
                            )}
                            <p className="text-[30px] font-normal mt-5">Transaction Completed..!!</p>
                        </div>
                        <p className="text-[#008000] text-center py-2">
                            Note: Your Transaction is completed.
                        </p>

                        {socketAmount && (
                             <p className="text-[#FF0000] text-center py-2 px-4">
                             Warning: Your transaction is completed but the amount received is 
                             <strong> ({statusData?.amount} {statusData?.assetId}) </strong> 
                             less than the expected amount 
                             <strong> ({statusData?.exactAmount} {statusData?.assetId}) </strong>.
                         </p>
                        )}

                        {bodyAmount && (
                             <p className="text-[#FF0000] text-center py-2 px-4">
                             Warning: Your transaction is completed but the amount received is 
                             <strong> ({body?.amount} {body?.assetId}) </strong> 
                             less than the expected amount 
                             <strong> ({body?.exactAmount} {body?.assetId} )</strong>.
                         </p>
                        )}
                        <div className="text-center">
                            <button
                                onClick={successHandler}
                                className="bg-[#008000] text-white px-12 py-3 ml-auto rounded mt-4"
                            >
                                OK
                            </button>
                        </div>

                        <p className="text-center text-[#000000]">
                            Redirecting in {timeLeft} seconds...
                        </p>
                    </div>
                </div>
            </Box>
        </>
    );
};

export default EcomInvoiceSuccess;
