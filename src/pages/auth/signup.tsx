import React, { useEffect, useState } from "react";
import SignUpForm from "~/components/signup/SignUpForm";
import EnterOTP from "~/components/signup/EnterOTP";
import SuccessMessage from "~/components/signup/SucessMsg";
import antigua from "~/assets/countryCodes/Antigua_1268.svg";
import bosnia from "~/assets/countryCodes/bosnia_387.svg";
import czech from "~/assets/countryCodes/czech_420.svg";
import pitcairn from "~/assets/countryCodes/Pitcairn_870.svg";
import hong_kong from "~/assets/countryCodes/hong_kong_852.svg";
import reunion from "~/assets/countryCodes/Reunion_262.svg";
import sao_tome from "~/assets/countryCodes/sao_tome_239.svg";
import svalbard from "~/assets/countryCodes/svalbard_47.svg";
import saint_vincent from "~/assets/countryCodes/Saint_Vincent_1784.svg";
import saint_lucia from "~/assets/countryCodes/Saint_Lucia_1758.svg";
import saint_helena from "~/assets/countryCodes/saint_helena_290.svg";
import ad from "~/assets/countryCodes/ad.svg";
import ae from "~/assets/countryCodes/ae.svg";
import au from "~/assets/countryCodes/au.svg";
import al from "~/assets/countryCodes/al.svg";
import aq from "~/assets/countryCodes/aq.svg";
import ar from "~/assets/countryCodes/ar.svg";
import at from "~/assets/countryCodes/at.svg";
import aw from "~/assets/countryCodes/aw.svg";
import be from "~/assets/countryCodes/be.svg";
import bg from "~/assets/countryCodes/bg.svg";
import bm from "~/assets/countryCodes/bm.svg";
import bt from "~/assets/countryCodes/bt.svg";
import bn from "~/assets/countryCodes/bn.svg";
import br from "~/assets/countryCodes/br.svg";
import ca from "~/assets/countryCodes/ca.svg";
import ch from "~/assets/countryCodes/ch.svg";
import cl from "~/assets/countryCodes/cl.svg";
import cr from "~/assets/countryCodes/cr.svg";
import cv from "~/assets/countryCodes/cv.svg";
import cy from "~/assets/countryCodes/cy.svg";
import de from "~/assets/countryCodes/de.svg";
import dk from "~/assets/countryCodes/dk.svg";
import ee from "~/assets/countryCodes/ee.svg";
import es from "~/assets/countryCodes/es.svg";
import fi from "~/assets/countryCodes/fi.svg";
import fk from "~/assets/countryCodes/fk.svg";
import fo from "~/assets/countryCodes/fo.svg";
import fr from "~/assets/countryCodes/fr.svg";
import gb from "~/assets/countryCodes/gb.svg";
import gd from "~/assets/countryCodes/gd.svg";
import gf from "~/assets/countryCodes/gf.svg";
import gg from "~/assets/countryCodes/gg.svg";
import gi from "~/assets/countryCodes/gi.svg";
import gl from "~/assets/countryCodes/gl.svg";
import gp from "~/assets/countryCodes/gp.svg";
import gr from "~/assets/countryCodes/gr.svg";
import hr from "~/assets/countryCodes/hr.svg";
import hu from "~/assets/countryCodes/hu.svg";
import ie from "~/assets/countryCodes/ie.svg";
import ind from "~/assets/countryCodes/in.svg";
import is from "~/assets/countryCodes/is.svg";
import it from "~/assets/countryCodes/it.svg";
import je from "~/assets/countryCodes/je.svg";
import jo from "~/assets/countryCodes/jo.svg";
import jp from "~/assets/countryCodes/jp.svg";
import kr from "~/assets/countryCodes/kr.svg";
import ke from "~/assets/countryCodes/ke.svg";
import ky from "~/assets/countryCodes/ky.svg";
import li from "~/assets/countryCodes/li.svg";
import lt from "~/assets/countryCodes/lt.svg";
import lk from "~/assets/countryCodes/lk.svg";
import lu from "~/assets/countryCodes/lu.svg";
import lv from "~/assets/countryCodes/lv.svg";
import ma from "~/assets/countryCodes/ma.svg";
import md from "~/assets/countryCodes/md.svg";
import me from "~/assets/countryCodes/me.svg";
import mg from "~/assets/countryCodes/mg.svg";
import mk from "~/assets/countryCodes/mk.svg";
import mq from "~/assets/countryCodes/mq.svg";
import ms from "~/assets/countryCodes/ms.svg";
import mt from "~/assets/countryCodes/mt.svg";
import mz from "~/assets/countryCodes/mz.svg";
import na from "~/assets/countryCodes/na.svg";
import nl from "~/assets/countryCodes/nl.svg";
import no from "~/assets/countryCodes/no.svg";
import nz from "~/assets/countryCodes/nz.svg";
import om from "~/assets/countryCodes/om.svg";
import ph from "~/assets/countryCodes/ph.svg";
import pl from "~/assets/countryCodes/pl.svg";
import pr from "~/assets/countryCodes/pr.svg";
import pt from "~/assets/countryCodes/pt.svg";
import qa from "~/assets/countryCodes/qa.svg";
import ru from "~/assets/countryCodes/ru.svg";
import ro from "~/assets/countryCodes/ro.svg";
import rs from "~/assets/countryCodes/rs.svg";
import se from "~/assets/countryCodes/se.svg";
import sg from "~/assets/countryCodes/sg.svg";
import si from "~/assets/countryCodes/si.svg";
import sk from "~/assets/countryCodes/sk.svg";
import sm from "~/assets/countryCodes/sm.svg";
import sn from "~/assets/countryCodes/sn.svg";
import tn from "~/assets/countryCodes/tn.svg";
import tr from "~/assets/countryCodes/tr.svg";
import tw from "~/assets/countryCodes/tw.svg";
import tz from "~/assets/countryCodes/tz.svg";
import uy from "~/assets/countryCodes/uy.svg";
import vn from "~/assets/countryCodes/vn.svg";
import xk from "~/assets/countryCodes/xk.svg";
import yt from "~/assets/countryCodes/yt.svg";
import za from "~/assets/countryCodes/za.svg";
import ua from "~/assets/countryCodes/ua.svg";
import ge from "~/assets/countryCodes/ge.svg";

import toast, { Toaster } from "react-hot-toast";
import {
  signup,
  verifyOtp,
  resendOtp,
  fetchCountries,
  getLegalDocuments,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import {
  DropDownOptionsResponseType,
  DropDownOptionsType,
} from "~/types/Common";
import { StaticImageData } from "next/image";
import { findIp } from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  countryCode: string;
  mobileNumber: string;
  password: string;
  reEnterPassword: string;
}

interface Screen {
  formScreen: boolean;
  otpScreen: boolean;
  successScreen: boolean;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  // Extract the day, month, and year components
  const day = date.getDate().toString().padStart(2, "0"); // Ensure 2-digit format
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Add 1 since months are zero-based
  const year = date.getFullYear();

  // Create the DD-MM-YYYY formatted date string
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

const Signup = () => {
  const screenInitialValues = {
    formScreen: false,
    otpScreen: false,
    successScreen: false,
  };
  const [signupData, setData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dob: "",
    countryCode: "+91",
    mobileNumber: "",
    password: "",
    reEnterPassword: "",
  });
  const [displayScreen, setDisplayScreen] =
    useState<Screen>(screenInitialValues);
  const [loading, setLoading] = useState(false);

  const { formScreen, otpScreen, successScreen } = displayScreen;
  const [disableResendButton, setDisableResendButton] = useState<boolean>(true);
  const [time, setTime] = useState<string>("00:30");
  const [countryList, setCountryList] = useState<DropDownOptionsType[]>([]);
  const [otpTransactionId, setOtpTransactionId] = useState<string>("");
  const [legalDocuments, setLegalDocuments] = useState<LegalDocuments[]>([]);

  const formattedData = (data: any) => {
    if (data.length > 0) {
      const finalList = data.map((val: DropDownOptionsResponseType) => ({
        value: val.countryCode,
        label: `+${val.countryCode}`,
        flag: countryFlags.find(
          (obj) => obj.countryCode === Number(val.countryCode),
        )?.flag,
      }));

      return finalList;
    }
  };

  const getCountryList = async () => {
    const [data] = await ApiHandler(fetchCountries);

    if (data?.success) {
      const body = data.body as Country[];

      if (body) {
        body.sort((a, b) => a.countryCode - b.countryCode);
        setCountryList(formattedData(body));
      }
    }

    return [];
  };
  const getDocumentList = async () => {
    const [data] = await ApiHandler(getLegalDocuments);

    if (data?.success) {
      const docValue = data.body as LegalDocuments[];
      setLegalDocuments(docValue);
    }
    return [];
  };

  useEffect(() => {
    getCountryList();
    getDocumentList();
    changeScreen("formScreen");

    const printIp = async () => {
      try {
        const ip = await findIp();
        localStorageService.setIpAddress(ip);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    printIp();
  }, []);

  const changeScreen = (name: string) => {
    setDisplayScreen({ ...screenInitialValues, [name]: true });
  };

  const submitData = async (values: FormData) => {
    setLoading(true);
    setData(values);
    const { firstName, lastName, dob, countryCode, mobileNumber, password } =
      values;

    const myIp = localStorageService.getIPAddress();
    const reqBody = {
      firstname: firstName,
      lastname: lastName,
      phone: mobileNumber,
      countryCode,
      password,
      dob: formatDate(dob),
      ipAddress: myIp ?? "",
    };

    const [data, error]: APIResult<{ otpTransactionId: string }> =
      await ApiHandler(signup, reqBody);
    if (error) {
      toast.error(error);
    }

    if (data?.success) {
      changeScreen("otpScreen");
      executeTimer(30);
      setOtpTransactionId(data?.body?.otpTransactionId);
    }

    setLoading(false);
  };

  const submitOTP = async (otp: string) => {
    setLoading(true);

    const [data, error] = await ApiHandler(verifyOtp, {
      code: otp,
      otpTransactionId,
    });

    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      changeScreen("successScreen");
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);

    const [data, error]: any = await ApiHandler(resendOtp, {
      otpTransactionId,
      countryCode: signupData.countryCode,
    });
    if (error) {
      toast.error(error);
    }

    if (data) {
      if (data.success) {
        executeTimer(30);
        setOtpTransactionId(data?.body?.otpTransactionId);
      }
    }
    setLoading(false);
  };

  const executeTimer = (seconds: number) => {
    setDisableResendButton(true);
    // Update the timer every second
    const intervalId = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(intervalId); // Stop the countdown when it reaches 0
        setDisableResendButton(false);
      } else {
        seconds--;
        const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
        const remainingSeconds = String(seconds % 60).padStart(2, "0");
        // Time format MM:SS
        const formattedTime = `${minutes}:${remainingSeconds}`;
        setTime(formattedTime);
      }
    }, 1000);
  };

  return (
    <div className="bg-black">
      <Toaster />

      {formScreen && (
        <SignUpForm
          setData={(data: FormData) => submitData(data)}
          data={signupData}
          loading={loading}
          countryList={countryList}
          legalDocument={legalDocuments}
        />
      )}

      {otpScreen && (
        <EnterOTP
          phone={`${signupData.countryCode} ${signupData.mobileNumber}`}
          onOtpSubmit={submitOTP}
          changeScreen={changeScreen}
          resendOTP={handleResendOTP}
          disableResendButton={disableResendButton}
          time={time}
        />
      )}

      {successScreen && <SuccessMessage />}
    </div>
  );
};

export default Signup;

const countryFlags = [
  {
    countryCode: 355,
    flag: al as StaticImageData,
    name: "Albania",
  },
  {
    countryCode: 376,
    name: "Andorra",
    flag: ad as StaticImageData,
  },
  {
    countryCode: 672,
    flag: aq as StaticImageData,
    name: "Antarctica",
  },
  {
    countryCode: 1268,
    flag: antigua as StaticImageData,
    name: "Antigua and Barbuda",
  },
  {
    countryCode: 54,
    flag: ar as StaticImageData,
    name: "Argentina",
  },
  {
    countryCode: 297,
    flag: aw as StaticImageData,
    name: "Aruba",
  },
  {
    countryCode: 61,
    flag: au as StaticImageData,
    name: "Australia",
  },
  {
    countryCode: 43,
    flag: at as StaticImageData,
    name: "Austria",
  },
  {
    countryCode: 32,
    flag: be as StaticImageData,
    name: "Belgium",
  },
  {
    countryCode: 1441,
    flag: bm as StaticImageData,
    name: "Bermuda",
  },
  {
    countryCode: 975,
    flag: bt as StaticImageData,
    name: "Bhutan",
  },
  {
    countryCode: 387,
    flag: bosnia as StaticImageData,
    name: "Bosnia and Herzegovina",
  },
  {
    countryCode: 55,
    name: "Brazil",
    flag: br as StaticImageData,
  },
  {
    countryCode: 673,
    name: "Brunei",
    flag: bn as StaticImageData,
  },
  {
    countryCode: 359,
    name: "Bulgaria",
    flag: bg as StaticImageData,
  },
  {
    countryCode: 1,
    name: "Canada",
    flag: ca as StaticImageData,
  },
  {
    countryCode: 238,
    name: "Cape Verde",
    flag: cv as StaticImageData,
  },
  {
    countryCode: 1345,
    name: "Cayman Islands",
    flag: ky as StaticImageData,
  },
  {
    countryCode: 56,
    name: "Chile",
    flag: cl as StaticImageData,
  },
  {
    countryCode: 506,
    name: "Costa Rica",
    flag: cr as StaticImageData,
  },
  {
    countryCode: 385,
    name: "Croatia",
    flag: hr as StaticImageData,
  },
  {
    countryCode: 357,
    name: "Cyprus",
    flag: cy as StaticImageData,
  },
  {
    countryCode: 420,
    name: "Czech Republic",
    flag: czech as StaticImageData,
  },
  {
    countryCode: 45,
    name: "Denmark",
    flag: dk as StaticImageData,
  },
  {
    countryCode: 372,
    name: "Estonia",
    flag: ee as StaticImageData,
  },
  {
    countryCode: 500,
    name: "Falkland Islands",
    flag: fk as StaticImageData,
  },
  {
    countryCode: 298,
    name: "Faroe Islands",
    flag: fo as StaticImageData,
  },
  {
    countryCode: 358,
    name: "Finland",
    flag: fi as StaticImageData,
  },
  {
    countryCode: 33,
    name: "France",
    flag: fr as StaticImageData,
  },
  {
    countryCode: 594,
    name: "French Guiana",
    flag: gf as StaticImageData,
  },
  {
    countryCode: 49,
    name: "Germany",
    flag: de as StaticImageData,
  },
  {
    countryCode: 350,
    name: "Gibraltar",
    flag: gi as StaticImageData,
  },
  {
    countryCode: 30,
    name: "Greece",
    flag: gr as StaticImageData,
  },
  {
    countryCode: 299,
    name: "Greenland",
    flag: gl as StaticImageData,
  },
  {
    countryCode: 1473,
    name: "Grenada",
    flag: gd as StaticImageData,
  },
  {
    countryCode: 590,
    name: "Guadeloupe",
    flag: gp as StaticImageData,
  },
  {
    countryCode: 441481,
    name: "Guernsey",
    flag: gg as StaticImageData,
  },
  {
    countryCode: 852,
    name: "Hong Kong",
    flag: hong_kong as StaticImageData,
  },
  {
    countryCode: 36,
    name: "Hungary",
    flag: hu as StaticImageData,
  },
  {
    countryCode: 354,
    name: "Iceland",
    flag: is as StaticImageData,
  },
  {
    countryCode: 91,
    name: "India",
    flag: ind as StaticImageData,
  },
  {
    countryCode: 353,
    name: "Ireland",
    flag: ie as StaticImageData,
  },
  {
    countryCode: 39,
    name: "Italy",
    flag: it as StaticImageData,
  },
  {
    countryCode: 81,
    name: "Japan",
    flag: jp as StaticImageData,
  },
  {
    countryCode: 441534,
    name: "Jersey",
    flag: je as StaticImageData,
  },
  {
    countryCode: 962,
    name: "Jordan",
    flag: jo as StaticImageData,
  },
  {
    countryCode: 254,
    name: "Kenya",
    flag: ke as StaticImageData,
  },
  {
    countryCode: 383,
    name: "Kosovo",
    flag: xk as StaticImageData,
  },
  {
    countryCode: 371,
    name: "Latvia",
    flag: lv as StaticImageData,
  },
  {
    countryCode: 423,
    name: "Liechtenstein",
    flag: li as StaticImageData,
  },
  {
    countryCode: 370,
    name: "Lithuania",
    flag: lt as StaticImageData,
  },
  {
    countryCode: 352,
    name: "Luxembourg",
    flag: lu as StaticImageData,
  },
  {
    countryCode: 261,
    name: "Madagascar",
    flag: mg as StaticImageData,
  },
  {
    countryCode: 356,
    name: "Malta",
    flag: mt as StaticImageData,
  },
  {
    countryCode: 441624,
    name: "Montserrat",
    flag: ms as StaticImageData,
  },
  {
    countryCode: 596,
    name: "Martinique",
    flag: mq as StaticImageData,
  },
  {
    countryCode: 262,
    name: "Mayotte",
    flag: yt as StaticImageData,
  },
  {
    countryCode: 373,
    name: "Moldova",
    flag: md as StaticImageData,
  },
  {
    countryCode: 382,
    name: "Montenegro",
    flag: me as StaticImageData,
  },
  {
    countryCode: 1664,
    name: "Montserrat",
    flag: ms as StaticImageData,
  },
  {
    countryCode: 212,
    name: "Morocco",
    flag: ma as StaticImageData,
  },
  {
    countryCode: 258,
    name: "Mozambique",
    flag: mz as StaticImageData,
  },
  {
    countryCode: 264,
    name: "Namibia",
    flag: na as StaticImageData,
  },
  {
    countryCode: 31,
    name: "Netherlands",
    flag: nl as StaticImageData,
  },
  {
    countryCode: 64,
    name: "New Zealand",
    flag: nz as StaticImageData,
  },
  {
    countryCode: 389,
    name: "North Macedonia",
    flag: mk as StaticImageData,
  },
  {
    countryCode: 47,
    name: "Norway",
    flag: no as StaticImageData,
  },
  {
    countryCode: 968,
    name: "Oman",
    flag: om as StaticImageData,
  },
  {
    countryCode: 63,
    name: "Philippines",
    flag: ph as StaticImageData,
  },
  {
    countryCode: 870,
    name: "Pitcairn Islands",
    flag: pitcairn as StaticImageData,
  },
  {
    countryCode: 48,
    name: "Poland",
    flag: pl as StaticImageData,
  },
  {
    countryCode: 351,
    name: "Portugal",
    flag: pt as StaticImageData,
  },
  {
    countryCode: 1787,
    name: "Puerto Rico",
    flag: pr as StaticImageData,
  },
  {
    countryCode: 974,
    name: "Qatar",
    flag: qa as StaticImageData,
  },
  {
    countryCode: 262,
    name: "Réunion",
    flag: reunion as StaticImageData,
  },
  {
    countryCode: 40,
    name: "Romania",
    flag: ro as StaticImageData,
  },
  {
    countryCode: 290,
    name: "Saint Helena",
    flag: saint_helena as StaticImageData,
  },
  {
    countryCode: 1758,
    name: "Saint Lucia",
    flag: saint_lucia as StaticImageData,
  },
  {
    countryCode: 1784,
    name: "Saint Vincent and the Grenadines",
    flag: saint_vincent as StaticImageData,
  },
  {
    countryCode: 378,
    name: "San Marino",
    flag: sm as StaticImageData,
  },
  {
    countryCode: 239,
    name: "São Tomé and Príncipe",
    flag: sao_tome as StaticImageData,
  },
  {
    countryCode: 221,
    name: "Senegal",
    flag: sn as StaticImageData,
  },
  {
    countryCode: 381,
    name: "Serbia",
    flag: rs as StaticImageData,
  },
  {
    countryCode: 65,
    name: "Singapore",
    flag: sg as StaticImageData,
  },
  {
    countryCode: 421,
    name: "Slovakia",
    flag: sk as StaticImageData,
  },
  {
    countryCode: 386,
    name: "Slovenia",
    flag: si as StaticImageData,
  },
  {
    countryCode: 27,
    name: "South Africa",
    flag: za as StaticImageData,
  },
  {
    countryCode: 82,
    name: "South Korea",
    flag: kr as StaticImageData,
  },
  {
    countryCode: 34,
    name: "Spain",
    flag: es as StaticImageData,
  },
  {
    countryCode: 94,
    name: "Sri Lanka",
    flag: lk as StaticImageData,
  },
  {
    countryCode: 47,
    name: "Svalbard and Jan Mayen",
    flag: svalbard as StaticImageData,
  },
  {
    countryCode: 46,
    name: "Sweden",
    flag: se as StaticImageData,
  },
  {
    countryCode: 41,
    name: "Switzerland",
    flag: ch as StaticImageData,
  },
  {
    countryCode: 886,
    name: "Taiwan",
    flag: tw as StaticImageData,
  },
  {
    countryCode: 255,
    name: "Tanzania",
    flag: tz as StaticImageData,
  },
  {
    countryCode: 216,
    name: "Tunisia",
    flag: tn as StaticImageData,
  },
  {
    countryCode: 90,
    name: "Turkey",
    flag: tr as StaticImageData,
  },
  {
    countryCode: 971,
    name: "United Arab Emirates",
    flag: ae as StaticImageData,
  },
  {
    countryCode: 44,
    name: "United Kingdom",
    flag: gb as StaticImageData,
  },
  {
    countryCode: 598,
    name: "Uruguay",
    flag: uy as StaticImageData,
  },
  {
    countryCode: 84,
    name: "Vietnam",
    flag: vn as StaticImageData,
  },
  {
    countryCode: 380,
    name: "Ukraine",
    flag: ua as StaticImageData,
  },
  {
    countryCode: 7,
    name: "Russian Federation",
    flag: ru as StaticImageData,
  },
  {
    countryCode: 995,
    name: "Georgia",
    flag: ge as StaticImageData,
  },
];
