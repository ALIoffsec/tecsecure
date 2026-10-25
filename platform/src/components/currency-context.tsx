"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { convertMinorAmount, CurrencyRates, SupportedCurrency, supportedCurrencies } from "@/lib/currency";
import { useSitePreferences } from "@/components/site-preferences";

type CurrencyContextValue = {
  currency: SupportedCurrency;
  rates: CurrencyRates | null;
  error: boolean;
  chooseCurrency: (currency: SupportedCurrency) => void;
  refreshRates: () => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const currencyStorageKey = "tecsecure-display-currency";

function isCurrencyRates(value: unknown): value is CurrencyRates {
  if (typeof value !== "object" || value === null || !("rates" in value) || !("date" in value)) return false;
  const data = value as { rates: unknown; date: unknown };
  if (typeof data.date !== "string" || typeof data.rates !== "object" || data.rates === null) return false;
  return supportedCurrencies.every((currency) => {
    const rate = (data.rates as Record<string, unknown>)[currency];
    return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
  });
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<SupportedCurrency>("UZS");
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [error, setError] = useState(false);

  const refreshRates = useCallback(async () => {
    setError(false);
    try {
      const response = await fetch("/api/currency-rates", { cache: "no-store" });
      if (!response.ok) throw new Error(`Valyuta kurslari so‘rovi muvaffaqiyatsiz: ${response.status}`);
      const result: unknown = await response.json();
      if (!isCurrencyRates(result)) throw new Error("Valyuta kurslari javobi noto‘g‘ri formatda.");
      setRates(result);
    } catch (issue) {
      console.error("Could not load display currency rates", issue);
      setRates(null);
      setError(true);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(currencyStorageKey);
    if (saved && supportedCurrencies.includes(saved as SupportedCurrency)) setCurrency(saved as SupportedCurrency);
    void refreshRates();
  }, [refreshRates]);

  const chooseCurrency = useCallback((next: SupportedCurrency) => {
    setCurrency(next);
    localStorage.setItem(currencyStorageKey, next);
  }, []);

  const value = useMemo(() => ({ currency, rates, error, chooseCurrency, refreshRates }), [
    currency, rates, error, chooseCurrency, refreshRates
  ]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("Currency components must be used within CurrencyProvider");
  return value;
}

export function CurrencySelector() {
  const { currency, rates, error, chooseCurrency, refreshRates } = useCurrency();
  const { t } = useSitePreferences();

  return <div className="currency-selector">
    <label>
      <span>{t("currency")}</span>
      <select
        value={currency}
        disabled={!rates}
        onChange={(event) => chooseCurrency(event.currentTarget.value as SupportedCurrency)}
        aria-label={t("currency")}
      >
        {supportedCurrencies.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
    <small aria-live="polite">
      {rates
        ? `${t("currencyRateDate")}: ${rates.date}`
        : error
          ? <>{t("currencyRatesUnavailable")} <button type="button" onClick={() => void refreshRates()}>{t("retry")}</button></>
          : t("currencyRatesLoading")}
    </small>
  </div>;
}

export function CurrencyPrice({ amountMinor, currency: sourceCurrency }: { amountMinor: number; currency: string }) {
  const { currency, rates } = useCurrency();
  const { t } = useSitePreferences();
  const source = sourceCurrency.toUpperCase();
  const amount = rates ? convertMinorAmount(amountMinor, source, currency, rates.rates) : null;
  const displayCurrency = amount === null ? source : currency;
  const majorAmount = amount ?? amountMinor / 100;
  const formatted = `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: displayCurrency === "UZS" ? 0 : 2
  }).format(majorAmount)} ${displayCurrency}`;

  return <span className="currency-price">
    <span>{formatted}</span>
    {amount !== null && source !== currency && <small>{t("approximateCurrency")}</small>}
  </span>;
}
