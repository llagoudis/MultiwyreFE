/* eslint-disable @next/next/no-img-element */
import React, { Fragment } from "react";
import { tableFormatDate } from "~/helpers/helper";
interface StatementReportProps {
  row: any;
}
[];

const StatementReportSafari: React.FC<StatementReportProps> = ({ row }) => {
  function getFlooredFixed(v: any, d: any) {
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }

  return (
    <Fragment>
      <div style={{ width: "auto", margin: "2rem auto" }}>
        Statement Report for Safari
      </div>
    </Fragment>
  );
};

export default StatementReportSafari;
