import React from "react";
import { useTimer } from "react-timer-hook";
import { LinearProgress } from "@mui/material";

type TimerProps = {
  initialTime: number;
  onTimerComplete: () => void;
};

const Timer: React.FC<TimerProps> = ({ initialTime, onTimerComplete }) => {
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + initialTime);

  const { seconds, minutes, start, pause, resume, restart, isRunning } =
    useTimer({
      expiryTimestamp,
      onExpire: onTimerComplete,
    });

  const progress = ((seconds + minutes * 60) / initialTime) * 100;

  return (
    <div className="w-full">
      <p className="mb-2">
        Expires in{" "}
        {`${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`}
      </p>
      <LinearProgress
        variant="determinate"
        color="warning"
        sx={{
          height: 10,
          borderRadius: 10,
          border: 1,
          borderColor: "#BABABA",
          backgroundColor: "white",
        }}
        value={progress}
      />
    </div>
  );
};

export default Timer;

// import React, { useEffect, useState } from "react";
// import { LinearProgress } from "@mui/material";

// type TimerProps = {
//   initialTime: number;
//   onTimerComplete: () => void;
// };

// const Timer: React.FC<TimerProps> = ({ initialTime, onTimerComplete }) => {
//   const [remainingTime, setRemainingTime] = useState(initialTime);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setRemainingTime((prevTime) => {
//         if (prevTime <= 0) {
//           clearInterval(interval);
//           onTimerComplete();
//           return 0;
//         } else {
//           return prevTime - 1;
//         }
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [initialTime, onTimerComplete]);

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = time % 60;
//     return `${minutes.toString().padStart(2, "0")}:${seconds
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   return (
//     <div className="w-full">
//       <p className="mb-2">Expires in {formatTime(remainingTime)}</p>
//       <LinearProgress
//         variant="determinate"
//         color="warning"
//         sx={{
//           height: 10,
//           borderRadius: 10,
//           border: 1,
//           borderColor: "#BABABA",
//           backgroundColor: "white",
//         }}
//         value={(remainingTime / initialTime) * 100}
//       />
//     </div>
//   );
// };

// export default Timer;
