"use client"

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { ExchangeRates } from '@/lib/currency';

interface CurrencyContextProps {
  userCurrency: string;
  rates: ExchangeRates;
  formatCurrency: (usdAmount: number) => string;
  convertFromUSD: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  userCurrency: string;
  rates: ExchangeRates;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ 
  children, 
  userCurrency, 
  rates 
}) => {
  
  // Safe fallback to USD if currency is completely missing or wrong
  const activeCurrency = rates[userCurrency] ? userCurrency.toUpperCase() : "USD";

  const convertFromUSD = (usdAmount: number): number => {
    const rate = rates[activeCurrency] || 1;
    return usdAmount * rate;
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
    rates,
    formatCurrency,
    convertFromUSD
  }), [activeCurrency, rates]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
