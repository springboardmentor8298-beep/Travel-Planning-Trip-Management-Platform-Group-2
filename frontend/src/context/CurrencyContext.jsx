import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'INR (Indian Rupee)', rate: 1.0 },
  USD: { code: 'USD', symbol: '$', name: 'USD (US Dollar)', rate: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'EUR (Euro)', rate: 0.011 },
  GBP: { code: 'GBP', symbol: '£', name: 'GBP (British Pound)', rate: 0.0094 }
};

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('tripnest_currency') || 'INR';
  });

  useEffect(() => {
    // Sync currency preference from logged-in user profile if available
    const fetchUserCurrency = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data?.currencyPreference && CURRENCIES[res.data.currencyPreference]) {
          setCurrencyState(res.data.currencyPreference);
          localStorage.setItem('tripnest_currency', res.data.currencyPreference);
        }
      } catch (e) {}
    };
    fetchUserCurrency();
  }, []);

  const changeCurrency = async (newCurr) => {
    if (!CURRENCIES[newCurr]) return;
    setCurrencyState(newCurr);
    localStorage.setItem('tripnest_currency', newCurr);

    try {
      await api.put('/users/profile', { currencyPreference: newCurr });
    } catch (e) {}
  };

  const formatAmount = (amountInBaseINR) => {
    const val = Number(amountInBaseINR) || 0;
    const info = CURRENCIES[currency] || CURRENCIES.INR;
    const converted = val * info.rate;
    
    // Format digits smoothly
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });

    return `${info.symbol}${formatted}`;
  };

  const currencySymbol = CURRENCIES[currency]?.symbol || '₹';

  return (
    <CurrencyContext.Provider value={{
      currency,
      changeCurrency,
      formatAmount,
      currencySymbol,
      currencies: CURRENCIES
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
