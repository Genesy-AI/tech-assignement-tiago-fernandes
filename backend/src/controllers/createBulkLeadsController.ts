import { Request, Response } from 'express'
import { mapValidLeads } from '../lead'
import { LeadModel } from '../lead/model'
import { Lead, LeadResults, LeadError } from '../lead/types'
import * as LeadRepository from '../lead/repository'

/**
 * Create bulk leads controller
 * @param req
 * @param res
 * @returns
 */
export const createBulkLeadsController = async (req: Request, res: Response) => {
  try {
    const { leads } = req.body

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'leads must be a non-empty array' })
    }

    // IMPROVEMENT: input validation extra step regardless of the frontend validation?
    const validLeads: Lead[] = mapValidLeads(leads)

    if (validLeads.length === 0) {
      return res
        .status(400)
        .json({ error: 'No valid leads found. firstName, lastName, and email are required.' })
    }

    // IMPROVEMENT: LeadRepository and LeadService abstraction
    const newLeads: Lead[] = await findNewLeads(validLeads)

    // IMPROVEMENT: parallelise it make this loops async, do a promise.all to create all in parallel
    const { importedCount, errors }: LeadResults = await LeadRepository.createLeads(newLeads)

    res.json({
      success: true,
      importedCount,
      duplicatesSkipped: validLeads.length - newLeads.length,
      invalidLeads: leads.length - validLeads.length,
      errors,
    })
  } catch (error) {
    // IMPROVEMENT: Error Handling middleware, throw error(message)
    console.error('Error importing leads:', error)
    res.status(500).json({ error: 'Failed to import leads' })
  }
}

/**
 * Find new leads that are not already in the database
 * based on firstName and lastName
 * @param validLeads - array of valid leads
 * @returns array of new leads
 */
export const findNewLeads = async (validLeads: Lead[]): Promise<Lead[]> => {
  const existingLeads = await LeadRepository.findExistingLeads(validLeads)
  const existingLeadKeys = toExistingLeadKeys(existingLeads)
  return filterUniqueValidLeads(validLeads, existingLeadKeys)
}

/**
 * Creates a list of lead keys from the existing leads
 * @param existingLeads - array of existing leads
 * @returns set of unique lead keys
 */
export const toExistingLeadKeys = (existingLeads: LeadModel[]): Set<string> => {
  return new Set(
    existingLeads.map((lead) => `${lead.firstName.toLowerCase()}_${lead.lastName.toLowerCase()}`)
  )
}

/**
 * Filter out the valid leads that are already in the database
 * @param validLeads - array of valid leads
 * @param existingLeadKeys - set of unique lead keys
 * @returns array of unique valid leads
 */
export const filterUniqueValidLeads = (validLeads: Lead[], existingLeadKeys: Set<string>): Lead[] => {
  return validLeads.filter((lead) => {
    const key = `${lead.firstName.toLowerCase()}_${lead.lastName?.toLowerCase()}`
    return !existingLeadKeys.has(key)
  })
}
