import { describe, it, expect, vi, beforeEach } from 'vitest'
import { filterUniqueValidLeads, toExistingLeadKeys, findNewLeads } from './createBulkLeadsController'
import type { LeadModel } from '../lead/model'
import type { Lead } from '../lead/types'

vi.mock('../lead/repository', () => ({
  findExistingLeads: vi.fn(),
}))
import * as LeadRepository from '../lead/repository'

describe('createBulkLeadsController helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toExistingLeadKeys', () => {
    it('builds lowercase keys from existing leads', () => {
      const existing: LeadModel[] = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          firstName: 'John',
          lastName: 'Doe',
          email: '',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
        {
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          firstName: 'JANE',
          lastName: 'ROE',
          email: '',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
      ]

      const keys = toExistingLeadKeys(existing)
      expect(keys.has('john_doe')).toBe(true)
      expect(keys.has('jane_roe')).toBe(true)
      expect(keys.has('John_Doe')).toBe(false)
    })
  })

  describe('filterUniqueValidLeads', () => {
    it('filters out leads present in existing keys (case-insensitive)', () => {
      const valid: Lead[] = [
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
        {
          firstName: 'Jane',
          lastName: 'Roe',
          email: 'jane@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
        {
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
      ]
      const keys = new Set(['john_doe'])

      const result = filterUniqueValidLeads(valid, keys)
      expect(result).toEqual([
        {
          firstName: 'Jane',
          lastName: 'Roe',
          email: 'jane@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
        {
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
      ])
    })
  })

  describe('findNewLeads', () => {
    it('uses repository to filter out existing leads', async () => {
      const valid: Lead[] = [
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
        {
          firstName: 'Jane',
          lastName: 'Roe',
          email: 'jane@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
      ]
      ;(LeadRepository.findExistingLeads as any).mockResolvedValue([{ firstName: 'john', lastName: 'doe' }])

      const result = await findNewLeads(valid)
      expect(LeadRepository.findExistingLeads).toHaveBeenCalledWith(valid)
      expect(result).toEqual([
        {
          firstName: 'Jane',
          lastName: 'Roe',
          email: 'jane@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
      ])
    })
  })
})
