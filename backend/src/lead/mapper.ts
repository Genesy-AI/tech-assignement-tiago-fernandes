// IMPROVEMENT: Interfaces and DTOs to a different layer
// IMPROVEMENT: Lead as a Class with methods to validate
import { Lead } from './types'
// map DTO to LEadmModel
export function mapToLead(lead: any): Lead {
  if (!isValidLead(lead)) {
    // TODO need to catch this error in the controller!
    console.error('Invalid lead - ', lead)
    throw new Error('Invalid lead')
  }

  return {
    firstName: lead.firstName.trim(),
    lastName: lead.lastName.trim(),
    email: lead.email.trim(),
    jobTitle: lead.jobTitle?.trim() || null,
    companyName: lead.companyName?.trim() || null,
    countryCode: lead.countryCode?.trim() || null,
    phoneNumber: lead.phoneNumber?.trim() || null,
    yearsAtCompany: lead.yearsAtCompany?.trim() || null,
    linkedinProfile: lead.linkedinProfile?.trim() || null,
  }
}

// duplicated from frontend/src/utils/csvParser.ts
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidLead(lead: any): boolean {
  const firstName = lead.firstName
  const lastName = lead.lastName
  const email = lead.email

  // mandatory non-null and non-empty fields
  if (!(firstName && lastName && email)) {
    return false
  }

  // Validate required fields exist as strings and are not empty after trimming
  const hasStringFirstName = typeof firstName === 'string'
  const hasStringLastName = typeof lastName === 'string'
  const hasStringEmail = typeof email === 'string'

  if (!hasStringFirstName || !hasStringLastName || !hasStringEmail) {
    return false
  }
  // Ensure booleans returned, and validate types of optional fields first
  if (!!lead.companyName && typeof lead.companyName !== 'string') {
    return false
  }
  if (!!lead.countryCode && typeof lead.countryCode !== 'string') {
    return false
  }
  if (!!lead.phoneNumber && typeof lead.phoneNumber !== 'string') {
    return false
  }
  if (!!lead.yearsAtCompany && typeof lead.yearsAtCompany !== 'string') {
    return false
  }
  if (!!lead.linkedinProfile && typeof lead.linkedinProfile !== 'string') {
    return false
  }

  // the most expensive calculation goes last
  if (!isValidEmail(lead.email.trim())) {
    return false
  }

  return true
}
// TODO
const existsAndIsString = (value: any): boolean => {
  return value !== null && value !== undefined && typeof value === 'string'
}
/**
 * Validate and map raw leads to Leads,
 * omits invalid leads.
 *
 * @param leads - array of leads to filter
 * @returns array of valid leads
 */
export const mapValidLeads = (leads: any[]): Lead[] => {
  const validLeads: Lead[] = leads
    .map((lead) => {
      try {
        return mapToLead(lead)
      } catch (error) {
        // TODO remove these logs
        // how should we log the invalid leads?
        console.log('lead', lead)
        console.error('Error mapping lead:', error)
        return null
      }
    })
    .filter((lead) => !!lead)

  return validLeads
}
