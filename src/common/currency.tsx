export function currencyNoSymbol(num_value: number) {
  const text_value = num_value.toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
  });

  const withoutSymbol = text_value.replace(/€/g, "");

  return withoutSymbol.trim();
}

export function currencySymbol(num_value: number) {
  const text_value = num_value.toLocaleString("en-ER", {
    style: "currency",
    currency: "EUR",
  });

  return text_value;
}

export function currencyDollar(num_value: number) {
  const text_value = num_value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",

    maximumFractionDigits: 5,
  });

  return text_value;
}
