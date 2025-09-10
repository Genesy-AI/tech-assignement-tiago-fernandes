import { prisma } from '../index'
import { Lead, LeadCreationResults, LeadCreationResult } from './types'
import { LeadModel } from './model'

/**
 * Create leads in the database
 * (parallelises the create leads operation)
 *
 * @param leads - array of leads
 * @returns results of the create leads operation
 */
export const createLeads = async (leads: Lead[]): Promise<LeadCreationResults> => {
  const results = await Promise.all(leads.map(createLead))

  // format the results into the LeadCreationResults object
  return results.reduce(
    ({ errors, importedCount }, { error, lead }) => {
      if (!!error) {
        errors.push({ error, lead })
      } else {
        importedCount += 1
      }
      return { errors, importedCount }
    },
    { errors: [] as LeadCreationResult[], importedCount: 0 } as LeadCreationResults
  )
}

/**
 * Create a lead in the database
 * if operation fails, returns the error and the lead
 * @param lead - lead object
 * @returns results of the create lead operation
 */
export const createLead = async (lead: Lead): Promise<LeadCreationResult> => {
  let error: string | null = null
  try {
    await prisma.lead.create({
      data: { ...lead },
    })
    return { error: null, lead }
  } catch (e: unknown) {
    console.error('Error creating lead:', { lead, error: e })
    error = e instanceof Error ? e.message : 'Unknown error'
    return { error, lead }
  }
}

/**
 * Get the existing leads from the database
 * @param validLeads - array of valid leads
 * @param validLeads
 * @returns array of existing leads
 */
export const findExistingLeads = async (validLeads: Lead[]): Promise<LeadModel[]> => {
  return await prisma.lead.findMany({
    where: {
      OR: validLeads.map((lead) => ({
        AND: [{ firstName: lead.firstName.trim() }, { lastName: lead.lastName.trim() }],
      })),
    },
  })
}
