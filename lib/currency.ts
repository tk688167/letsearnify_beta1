export interface ExchangeRates {
  [currency: string]: number;
}

let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  
  if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedRates;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 } // Next.js ISR caching (1 hour)
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }
    
    const data = await response.json();
    if (data && data.rates) {
      cachedRates = data.rates;
      lastFetchTime = now;
      return cachedRates!;
    }
  } catch (error) {
    console.error("Currency API Error:", error);
  }

  // Fallback rates if API fails or is offline
  return cachedRates || {
    "USD": 1,
    "PKR": 278.50,
    "INR": 83.20,
    "AED": 3.67,
    "BDT": 109.70
  };
}
