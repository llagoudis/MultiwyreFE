import React, { useState } from "react";
import OrderInReview from "./OrderInReview";
import BuyCreditCard from "./BuyCreditCard";

interface PlayWithCardProps {
  changeScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction;
}

const CardMainScreen: React.FC<PlayWithCardProps> = ({
  changeScreen,
  trxDetails,
}) => {
  const [currentScreen, setCurrentScreen] = useState<string>("screen1");

  const changeCardScreen = (screen: string) => {
    console.log(`Changing screen to: ${screen}`);
    setCurrentScreen(screen);
  };

  return (
    <div>
      {/* {currentScreen === "screen1" && <BuyCreditCard trxDetails={trxDetails} />}

      {trxDetails?.paymentMethod === "Bank Transfer" && <></>}

      {currentScreen === "screen2" && (
        <OrderInReview
          trxDetails={trxDetails}
          changeCardScreen={changeCardScreen}
          changeScreen={changeScreen}
        />
      )} */}
    </div>
  );
};

export default CardMainScreen;
