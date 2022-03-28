export function expireDateFormatter(old: string, current: string) {
  if (current.length === 1 && Number(current) > 1) {
    return "0" + current;
  }
  if (current.length === 3 && !current.includes("/")) {
    return old + "/" + current.slice(-1);
  }
  return current;
}

export function cleanSpaces(text: string) {
  return text.replace(/\s/g, "");
}

export function moneyFormat(
  amount: number,
  decimalDigits: number = 2,
  fractionDigits: number = 2
) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount ? amount / Math.pow(10, decimalDigits) : 0);
}
