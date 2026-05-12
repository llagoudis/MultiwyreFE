import React, { type ReactNode, type FC } from "react";

interface StatusTextProps {
  children: ReactNode;
  color: string;
}

const StatusText: FC<StatusTextProps> = ({ children, color }) => {
  return (
    <span style={{
      backgroundColor: color,
      color: "black",
      paddingTop: "5px",
      paddingRight: "7px",
      paddingBottom: "5px",
      paddingLeft: "7px",
      borderRadius: "5px",
      textTransform: "capitalize",
    }}>{children}</span>
  )
}

export default StatusText;