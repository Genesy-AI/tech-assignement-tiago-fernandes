import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isValidEmail, isValidLead, mapToLead, mapValidLeads } from './mapper'

describe('Lead mapper', () => {
  describe('isValidEmail', () => {
    it('validates correct emails', () => {
      expect(isValidEmail('john.doe@example.com')).toBe(true)
      expect(isValidEmail('a+b.c_d@example.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false)
      expect(isValidEmail('foo@bar')).toBe(false)
      expect(isValidEmail('foo@bar.')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isValidLead', () => {
    it('returns true for minimal valid lead', () => {
      const lead = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
      expect(isValidLead(lead)).toBe(true)
    })

    it('returns false for wrong optional field types', () => {
      expect(isValidLead({ firstName: 'A', lastName: 'B', email: 'a@b.com', companyName: 123 })).toBe(false)
      expect(isValidLead({ firstName: 'A', lastName: 'B', email: 'a@b.com', countryCode: 1 })).toBe(false)
      expect(isValidLead({ firstName: 'A', lastName: 'B', email: 'a@b.com', phoneNumber: 123 })).toBe(false)
      expect(isValidLead({ firstName: 'A', lastName: 'B', email: 'a@b.com', yearsAtCompany: 5 })).toBe(false)
      expect(isValidLead({ firstName: 'A', lastName: 'B', email: 'a@b.com', linkedinProfile: {} })).toBe(
        false
      )
    })

    it('returns false when required fields missing or invalid', () => {
      expect(isValidLead({ lastName: 'Doe', email: 'john@example.com' })).toBe(false)
      expect(isValidLead({ firstName: 'John', email: 'john@example.com' })).toBe(false)
      expect(isValidLead({ firstName: 'John', lastName: 'Doe' })).toBe(false)
      expect(isValidLead({ firstName: '', lastName: 'Doe', email: 'john@example.com' })).toBe(false)
      expect(isValidLead({ firstName: 'John', lastName: '', email: 'john@example.com' })).toBe(false)
      expect(isValidLead({ firstName: 'John', lastName: 'Doe', email: 'not-email' })).toBe(false)
    })
  })

  describe('mapToLead', () => {
    it('maps and trims fields for a valid lead', () => {
      const raw = {
        firstName: ' John ',
        lastName: ' Doe',
        email: ' john.doe@example.com ',
        jobTitle: ' Dev ',
        companyName: ' ACME ',
        countryCode: ' US ',
        phoneNumber: ' 123 ',
        yearsAtCompany: ' 2 ',
        linkedinProfile: ' https://linkedin.com/in/john ',
      }
      const mapped = mapToLead(raw)
      expect(mapped).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Dev',
        companyName: 'ACME',
        countryCode: 'US',
        phoneNumber: '123',
        yearsAtCompany: '2',
        linkedinProfile: 'https://linkedin.com/in/john',
      })
    })

    it('sets optional fields to null when missing/empty', () => {
      const raw = { firstName: 'A', lastName: 'B', email: 'a@b.com' }
      const mapped = mapToLead(raw)
      expect(mapped).toEqual({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        jobTitle: null,
        companyName: null,
        countryCode: null,
        phoneNumber: null,
        yearsAtCompany: null,
        linkedinProfile: null,
      })
    })

    it('returns null when invalid and logs details', () => {
      const raw = { firstName: '', lastName: 'Doe', email: 'john@example.com' }
      expect(mapToLead(raw as any)).toBeNull()
    })
  })

  describe('mapValidLeads', () => {
    it('maps valid leads and omits invalid ones', () => {
      const inputs = [
        { firstName: ' John ', lastName: ' Doe ', email: ' john@example.com ' },
        { firstName: '', lastName: 'X', email: 'x@example.com' },
        { firstName: 'Jane', lastName: 'Roe', email: 'jane@example.com', companyName: 123 },
      ]
      const invalidInputs = [
        { firstName: 'John', lastName: 'Doe', email: 'john@example.com', companyName: 123 },
        { firstName: 'Jane', lastName: 'Roe', email: 'jane@example.com', companyName: 123 },
      ]
      const result = mapValidLeads(inputs as any[])
      const invalidResult = mapValidLeads(invalidInputs as any[])

      expect(result).toEqual([
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
      ])
      expect(invalidResult).toEqual([])
    })
  })
})
