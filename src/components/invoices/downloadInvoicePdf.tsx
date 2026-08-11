import ReactDOMServer from "react-dom/server";
import ReactDOM from "react-dom/client";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ApiHandler } from "~/service/UtilService";
import { fetchAddressDetails } from "~/service/ApiRequests";
import { convertImageToBase64 } from "~/helpers/helper";
import InvoiceTemplate from "./InvoiceTemplate";
import InvoiceTemplateSafari from "./InvoiceTemplateSafari";

export async function downloadInvoicePdf(row: Invoices) {
  const [res] = await ApiHandler<{
    invoiceImg: OnvoiceDetailsProp;
    bankDetails: bankDetailsProp;
    fromAddress: addressDetailsProp;
  }>(() => fetchAddressDetails(row?.projectId));

  const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
  const base64 = await convertImageToBase64(res?.body?.invoiceImg?.invoiceImgLink);
  const qrBase64 = await QRCode.toDataURL(row.invoiceURL || "", { width: 120 });

  if (isSafari) {
    const htmlTemplate = ReactDOMServer.renderToStaticMarkup(
      <InvoiceTemplateSafari
        invoice={row}
        addressDetails={res?.body?.fromAddress}
        bankDetails={res?.body?.bankDetails}
        invoiceImageUrl={res?.body?.invoiceImg}
        base64={base64}
        qrImage={qrBase64}
      />,
    );
    const win = window.open("", "_blank");
    if (!win) return;
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join("\n");
    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Invoice_${row?.id}</title>${styles}</head><body>${htmlTemplate}</body></html>`);
    win.print();
    return;
  }

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  await new Promise((resolve) => {
    root.render(
      <InvoiceTemplate
        invoice={row}
        addressDetails={res?.body?.fromAddress}
        bankDetails={res?.body?.bankDetails}
        invoiceImageUrl={res?.body?.invoiceImg}
        base64={base64}
        qrImage={qrBase64}
      />,
    );
    setTimeout(resolve, 500);
  });

  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL("image/jpeg", 1.0);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

  const linkElement = container.querySelector<HTMLAnchorElement>(".pdf-link");
  if (linkElement) {
    const rect = linkElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const pxToMm = (px: number) => px * 0.264583;
    pdf.link(
      pxToMm(rect.left - containerRect.left),
      pxToMm(rect.top - containerRect.top),
      pxToMm(rect.width),
      pxToMm(rect.height),
      { url: linkElement.href },
    );
  }

  const blobUrl = URL.createObjectURL(pdf.output("blob"));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `Invoice_${row?.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
  root.unmount();
  document.body.removeChild(container);
}
