import { describe, it, expect } from 'vitest'
import { isValidCountryCode } from './countryCode'

describe('isValidCountryCode', () => {
  it('should return true for valid country codes', () => {
    expect(isValidCountryCode('US')).toBe(true)
    expect(isValidCountryCode('ES')).toBe(true)
  })

  it('should return true if the country code is lowercase', () => {
    expect(isValidCountryCode('pt')).toBe(true)
    expect(isValidCountryCode('es')).toBe(true)
  })

  it('should return false if the country code is malformed, non-existent or empty', () => {
    expect(isValidCountryCode('')).toBe(false)
    expect(isValidCountryCode('invalid')).toBe(false)
    expect(isValidCountryCode('UK')).toBe(false)
  })
})
