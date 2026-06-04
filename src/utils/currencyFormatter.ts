export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

export function formatCurrency(
  cents: number,
  symbol: string = '$',
  position: 'prefix' | 'suffix' = 'prefix'
): string {
  const isNegative = cents < 0
  const value = fromCents(Math.abs(cents))
  const isInteger = Number.isInteger(value)
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  })
  const sign = isNegative ? '-' : ''
  return position === 'prefix' ? `${sign}${symbol}${formatted}` : `${sign}${formatted} ${symbol}`
}
