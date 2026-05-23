import type { InitiatePaymentInput } from "@medusajs/framework/types";
import { BigNumber, MathBN } from "@medusajs/framework/utils";

function getCurrencyMultiplier(currencyCode: string) {
  const zeroDecimalCurrencies = new Set([
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ]);
  const threeDecimalCurrencies = new Set([
    "BHD",
    "IQD",
    "JOD",
    "KWD",
    "OMR",
    "TND",
  ]);
  const normalizedCurrency = currencyCode.toUpperCase();

  if (zeroDecimalCurrencies.has(normalizedCurrency)) {
    return 1;
  }

  if (threeDecimalCurrencies.has(normalizedCurrency)) {
    return 1000;
  }

  return 100;
}

export function toSmallestUnit(
  amount: InitiatePaymentInput["amount"],
  currency: string,
) {
  const multiplier = getCurrencyMultiplier(currency);
  const normalizedAmount =
    Math.round(new BigNumber(MathBN.mult(amount, multiplier)).numeric) /
    multiplier;
  const smallestAmount = new BigNumber(
    MathBN.mult(normalizedAmount, multiplier),
  );

  return Number.parseInt(
    smallestAmount.numeric.toString().split(".")[0] ?? "0",
    10,
  );
}

export function fromSmallestUnit(amount: number, currency: string) {
  return amount / getCurrencyMultiplier(currency);
}
