import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createBulkLeadsController } from './createBulkLeadsController'

// Mock the barrel module `../lead` to control `mapValidLeads`
vi.mock('../lead', () => ({
  mapValidLeads: vi.fn(),
}))

// Mock the repository module used inside the controller
vi.mock('../lead/repository', () => ({
  createLeads: vi.fn(),
  findExistingLeads: vi.fn(),
}))

import { mapValidLeads } from '../lead'
import * as LeadRepository from '../lead/repository'

const buildRes = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('createBulkLeadsController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 400 when leads is not a non-empty array', async () => {
    const req: any = { body: { leads: null } }
    const res = buildRes()

    await createBulkLeadsController(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'leads must be a non-empty array' })
  })

  it('returns 400 when no valid leads are found', async () => {
    ;(mapValidLeads as any).mockReturnValue([])
    const req: any = { body: { leads: [{}, {}] } }
    const res = buildRes()

    await createBulkLeadsController(req, res)
    expect(mapValidLeads).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'No valid leads found. firstName, lastName, and email are required.',
    })
  })

  it('returns success response with counts and errors, filtering duplicates', async () => {
    const validLeads = [
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { firstName: 'Jane', lastName: 'Roe', email: 'jane@example.com' },
      { firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com' },
    ]
    ;(mapValidLeads as any).mockReturnValue(validLeads)

    // Simulate that one existing lead (case-insensitive match on first/last) already exists
    ;(LeadRepository.findExistingLeads as any).mockResolvedValue([{ firstName: 'john', lastName: 'doe' }])

    // Only two new leads should be created
    ;(LeadRepository.createLeads as any).mockResolvedValue({ importedCount: 2, errors: [] })

    const req: any = { body: { leads: validLeads } }
    const res = buildRes()

    await createBulkLeadsController(req, res)

    expect(mapValidLeads).toHaveBeenCalledWith(validLeads)
    expect(LeadRepository.findExistingLeads).toHaveBeenCalled()
    expect(LeadRepository.createLeads).toHaveBeenCalledWith([
      { firstName: 'Jane', lastName: 'Roe', email: 'jane@example.com' },
      { firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com' },
    ])

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      importedCount: 2,
      duplicatesSkipped: 1, // one duplicate filtered out
      invalidLeads: 0, // all three provided were considered valid by mapValidLeads
      errors: [],
    })
  })

  it('returns 500 when repository throws', async () => {
    const validLeads = [{ firstName: 'Jane', lastName: 'Roe', email: 'jane@example.com' }]
    ;(mapValidLeads as any).mockReturnValue(validLeads)
    ;(LeadRepository.findExistingLeads as any).mockResolvedValue([])
    ;(LeadRepository.createLeads as any).mockRejectedValue(new Error('db down'))

    const req: any = { body: { leads: validLeads } }
    const res = buildRes()

    await createBulkLeadsController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to import leads' })
  })
})
