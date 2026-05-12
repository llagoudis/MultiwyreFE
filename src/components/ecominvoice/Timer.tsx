import React, { useEffect, useState } from 'react';

interface TimerProps {
  initialTime: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1); // Use functional update to get the latest value
      }, 1000);
      return () => clearInterval(interval);
    } else {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return <>{formatTime(timeLeft)}</>;
};

export default Timer;
