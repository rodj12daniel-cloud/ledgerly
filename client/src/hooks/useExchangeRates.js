import { useEffect, useState } from 'react'
import { api } from '../api'

export default function useExchangeRates(items, displayCurrency) {
  const [rates, setRates] = useState({})
  useEffect(() => {
    const currencies = [...new Set(items.map(item => item.currency || 'PHP'))].filter(currency => currency !== displayCurrency)
    if (!currencies.length) return setRates({})
    Promise.all(currencies.map(currency => api(`/rates?from=${currency}&to=${displayCurrency}`).then(data => [currency, data.rate]).catch(() => [currency, null])))
      .then(entries => setRates(Object.fromEntries(entries)))
  }, [items, displayCurrency])
  function convert(amount, currency = 'PHP') { return currency === displayCurrency ? amount : amount * (rates[currency] || 1) }
  return { rates, convert }
}
