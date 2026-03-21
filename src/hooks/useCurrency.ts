import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name_ar: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "SAR", symbol: "ر.س", name_ar: "ريال سعودي" },
  { code: "AED", symbol: "د.إ", name_ar: "درهم إماراتي" },
  { code: "KWD", symbol: "د.ك", name_ar: "دينار كويتي" },
  { code: "BHD", symbol: "د.ب", name_ar: "دينار بحريني" },
  { code: "QAR", symbol: "ر.ق", name_ar: "ريال قطري" },
  { code: "OMR", symbol: "ر.ع", name_ar: "ريال عماني" },
  { code: "EGP", symbol: "ج.م", name_ar: "جنيه مصري" },
  { code: "USD", symbol: "$", name_ar: "دولار أمريكي" },
  { code: "EUR", symbol: "€", name_ar: "يورو" },
  { code: "GBP", symbol: "£", name_ar: "جنيه إسترليني" },
  { code: "MAD", symbol: "د.م", name_ar: "درهم مغربي" },
  { code: "TRY", symbol: "₺", name_ar: "ليرة تركية" },
];

const DEFAULT_CURRENCY: CurrencyConfig = CURRENCIES[0]; // SAR

let cachedCurrency: CurrencyConfig | null = null;
let fetchPromise: Promise<CurrencyConfig> | null = null;

function fetchCurrency(): Promise<CurrencyConfig> {
  if (cachedCurrency) return Promise.resolve(cachedCurrency);
  if (fetchPromise) return fetchPromise;

  fetchPromise = supabase
    .from("store_settings")
    .select("value")
    .eq("key", "store_info")
    .maybeSingle()
    .then(({ data }) => {
      const code = (data?.value as any)?.currency || "SAR";
      const found = CURRENCIES.find((c) => c.code === code) || DEFAULT_CURRENCY;
      cachedCurrency = found;
      return found;
    })
    .catch(() => DEFAULT_CURRENCY);

  return fetchPromise;
}

/** Clear cache when currency is updated in settings */
export function invalidateCurrencyCache() {
  cachedCurrency = null;
  fetchPromise = null;
}

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyConfig>(cachedCurrency || DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(!cachedCurrency);

  useEffect(() => {
    fetchCurrency().then((c) => {
      setCurrency(c);
      setLoading(false);
    });
  }, []);

  return { currency, loading };
}
