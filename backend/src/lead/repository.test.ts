import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createLead, createLeads, findExistingLeads } from './repository'
import type { Lead } from './types'
import type { LeadModel } from './model'

// Mock Prisma
vi.mock('../index', () => ({
  prisma: {
    lead: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

// Import the mocked prisma after mocking
import { prisma } from '../index'
const mockPrisma = vi.mocked(prisma)

describe('Lead Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createLead', () => {
    const sampleLead: Lead = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      jobTitle: 'Developer',
      companyName: 'Tech Corp',
      countryCode: 'US',
      phoneNumber: '123-456-7890',
      yearsAtCompany: '2',
      linkedinProfile: 'https://linkedin.com/in/johndoe',
    }

    it('creates a lead successfully and returns null error', async () => {
      mockPrisma.lead.create.mockResolvedValue({ id: 1, ...sampleLead })

      const [error, lead] = await createLead(sampleLead)

      expect(error).toBeNull()
      expect(lead).toEqual(sampleLead)
      expect(mockPrisma.lead.create).toHaveBeenCalledWith({
        data: { ...sampleLead },
      })
    })

    it('handles database error and returns error message', async () => {
      const dbError = new Error('Database connection failed')
      mockPrisma.lead.create.mockRejectedValue(dbError)

      const [error, lead] = await createLead(sampleLead)

      expect(error).toBe('Database connection failed')
      expect(lead).toEqual(sampleLead)
      expect(console.error).toHaveBeenCalledWith('Error creating lead:', {
        lead: sampleLead,
        error: dbError,
      })
    })

    it('handles unknown error type and returns generic message', async () => {
      mockPrisma.lead.create.mockRejectedValue('Unknown error')

      const [error, lead] = await createLead(sampleLead)

      expect(error).toBe('Unknown error')
      expect(lead).toEqual(sampleLead)
    })

    it('handles null error and returns generic message', async () => {
      mockPrisma.lead.create.mockRejectedValue(null)

      const [error, lead] = await createLead(sampleLead)

      expect(error).toBe('Unknown error')
      expect(lead).toEqual(sampleLead)
    })
  })

  describe('createLeads', () => {
    const sampleLeads: Lead[] = [
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
        lastName: 'Smith',
        email: 'jane@example.com',
        jobTitle: 'Manager',
        companyName: 'Acme Corp',
        countryCode: 'CA',
        phoneNumber: null,
        yearsAtCompany: null,
        linkedinProfile: null,
      },
    ]

    it('creates all leads successfully', async () => {
      mockPrisma.lead.create
        .mockResolvedValueOnce({ id: 1, ...sampleLeads[0] })
        .mockResolvedValueOnce({ id: 2, ...sampleLeads[1] })

      const result = await createLeads(sampleLeads)

      expect(result).toEqual({
        importedCount: 2,
        errors: [],
      })
      expect(mockPrisma.lead.create).toHaveBeenCalledTimes(2)
    })

    it('handles mixed success and failure results', async () => {
      mockPrisma.lead.create
        .mockResolvedValueOnce({ id: 1, ...sampleLeads[0] })
        .mockRejectedValueOnce(new Error('Duplicate email'))

      const result = await createLeads(sampleLeads)

      expect(result).toEqual({
        importedCount: 1,
        errors: [
          {
            error: 'Duplicate email',
            lead: sampleLeads[1],
          },
        ],
      })
    })

    it('handles all leads failing', async () => {
      mockPrisma.lead.create
        .mockRejectedValueOnce(new Error('Database error'))
        .mockRejectedValueOnce(new Error('Validation error'))

      const result = await createLeads(sampleLeads)

      expect(result).toEqual({
        importedCount: 0,
        errors: [
          {
            error: 'Database error',
            lead: sampleLeads[0],
          },
          {
            error: 'Validation error',
            lead: sampleLeads[1],
          },
        ],
      })
    })

    it('handles empty leads array', async () => {
      const result = await createLeads([])

      expect(result).toEqual({
        importedCount: 0,
        errors: [],
      })
      expect(mockPrisma.lead.create).not.toHaveBeenCalled()
    })
  })

  describe('findExistingLeads', () => {
    const sampleLeads: Lead[] = [
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
        lastName: 'Smith',
        email: 'jane@example.com',
        jobTitle: null,
        companyName: null,
        countryCode: null,
        phoneNumber: null,
        yearsAtCompany: null,
        linkedinProfile: null,
      },
    ]

    const mockExistingLeads: LeadModel[] = [
      {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
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
    ]

    it('finds existing leads with correct query structure', async () => {
      mockPrisma.lead.findMany.mockResolvedValue(mockExistingLeads)

      const result = await findExistingLeads(sampleLeads)

      expect(result).toEqual(mockExistingLeads)
      expect(mockPrisma.lead.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              AND: [{ firstName: 'John' }, { lastName: 'Doe' }],
            },
            {
              AND: [{ firstName: 'Jane' }, { lastName: 'Smith' }],
            },
          ],
        },
      })
    })

    it('trims whitespace from firstName and lastName in query', async () => {
      const leadsWithWhitespace: Lead[] = [
        {
          firstName: '  John  ',
          lastName: '  Doe  ',
          email: 'john@example.com',
          jobTitle: null,
          companyName: null,
          countryCode: null,
          phoneNumber: null,
          yearsAtCompany: null,
          linkedinProfile: null,
        },
      ]

      mockPrisma.lead.findMany.mockResolvedValue([])

      await findExistingLeads(leadsWithWhitespace)

      expect(mockPrisma.lead.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              AND: [{ firstName: 'John' }, { lastName: 'Doe' }],
            },
          ],
        },
      })
    })

    it('handles empty leads array', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([])

      const result = await findExistingLeads([])

      expect(result).toEqual([])
      expect(mockPrisma.lead.findMany).toHaveBeenCalledWith({
        where: {
          OR: [],
        },
      })
    })

    it('handles database error', async () => {
      const dbError = new Error('Database connection failed')
      mockPrisma.lead.findMany.mockRejectedValue(dbError)

      await expect(findExistingLeads(sampleLeads)).rejects.toThrow('Database connection failed')
    })
  })
})
