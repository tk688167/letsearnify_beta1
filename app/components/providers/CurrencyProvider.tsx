"use client"

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { ExchangeRates } from '@/lib/currency';

interface CurrencyContextProps {
  userCurrency: string;
  rates: ExchangeRates;
  formatCurrency: (usdAmount: number) => string;
  convertFromUSD: (usdAmount: number) => number;
  convertToUSD: (userAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  userCurrency: string;
  rates: ExchangeRates;
}


const FALLBACK_RATES: ExchangeRates = {
  "USD": 1,
  "PKR": 278.50,
  "INR": 83.20,
  "AED": 3.67,
  "BDT": 109.70
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ 
  children, 
  userCurrency, 
  rates 
}) => {
  // Safe fallback to PKR if currency is completely missing or wrong
  const activeCurrency = (rates[userCurrency] || FALLBACK_RATES[userCurrency]) ? userCurrency.toUpperCase() : "PKR";
  const activeRates = useMemo(() => ({ ...FALLBACK_RATES, ...rates }), [rates]);

  const convertFromUSD = (usdAmount: number): number => {
    const rate = activeRates[activeCurrency] || 1;
    return usdAmount * rate;
  };
  
  const convertToUSD = (userAmount: number): number => {
    const rate = activeRates[activeCurrency] || 1;
    return userAmount / rate;
  };

  const getLocales = (currency: string) => {
    switch (currency) {
      case 'PKR': return 'en-PK';
      case 'INR': return 'en-IN';
      case 'AED': return 'en-AE';
      case 'BDT': return 'en-BD';
      default: return 'en-US';
    }
  }

  const formatCurrency = (usdAmount: number): string => {
    const convertedAmount = convertFromUSD(usdAmount);
    return new Intl.NumberFormat(getLocales(activeCurrency), {
      style: "currency",
      currency: activeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };

  const value = useMemo(() => ({
    userCurrency: activeCurrency,
    rates: activeRates,
    formatCurrency,
    convertFromUSD,
    convertToUSD
  }), [activeCurrency, activeRates]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const context = useContext(CurrencyContext);
  
  // Anti-Gravity Fix: If context is missing (SSR edge case), return a resilient fallback
  if (!context) {
    const defaultCurrency = "PKR";
    const defaultRate = FALLBACK_RATES[defaultCurrency];
    const getLocales = (currency: string) => {
        switch (currency) {
            case 'PKR': return 'en-PK';
            case 'INR': return 'en-IN';
            case 'AED': return 'en-AE';
            case 'BDT': return 'en-BD';
            default: return 'en-US';
        }
    }

    return {
      userCurrency: defaultCurrency,
      rates: FALLBACK_RATES,
      convertFromUSD: (usd: number) => usd * defaultRate,
      convertToUSD: (user: number) => user / defaultRate,
      formatCurrency: (usd: number) => {
          const converted = usd * defaultRate;
          return new Intl.NumberFormat(getLocales(defaultCurrency), {
              style: "currency",
              currency: defaultCurrency,
              minimumFractionDigits: 2
          }).format(converted);
      }
    };
  }
  
  return context;
};
