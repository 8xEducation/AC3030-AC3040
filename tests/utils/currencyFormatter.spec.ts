import { toCents, fromCents, formatCurrency } from '../../src/utils/currencyFormatter'

describe('currencyFormatter utilities', () => {
  describe('toCents', () => {
    it('should convert standard float amounts to integer cents', () => {
      expect(toCents(10.50)).toBe(1050)
      expect(toCents(0.99)).toBe(99)
      expect(toCents(100)).toBe(10000)
    })

    it('should eliminate floating-point precision issues via rounding', () => {
      // 0.1 + 0.2 in float is 0.30000000000000004
      const floatingResult = 0.1 + 0.2
      expect(toCents(floatingResult)).toBe(30)
      
      // 2.22 * 100 is 222.00000000000003 in standard JS multiplication sometimes
      expect(toCents(2.22)).toBe(222)
    })

    it('should handle zero correctly', () => {
      expect(toCents(0)).toBe(0)
    })
  })

  describe('fromCents', () => {
    it('should convert integer cents back to standard floats', () => {
      expect(fromCents(1050)).toBe(10.50)
      expect(fromCents(99)).toBe(0.99)
      expect(fromCents(10000)).toBe(100)
      expect(fromCents(0)).toBe(0)
    })
  })

  describe('formatCurrency', () => {
    it('should format cents with prefix currency symbol by default', () => {
      expect(formatCurrency(1050, '$', 'prefix')).toBe('$10.50')
      expect(formatCurrency(100000, '$', 'prefix')).toBe('$1,000.00')
    })

    it('should format cents with suffix currency symbol when specified', () => {
      expect(formatCurrency(1050, 'VNĐ', 'suffix')).toBe('10.50 VNĐ')
      expect(formatCurrency(50000, 'đ', 'suffix')).toBe('500.00 đ')
    })

    it('should handle negative cents formatting correctly', () => {
      expect(formatCurrency(-1050, '$', 'prefix')).toBe('-$10.50')
    })
  })
})
