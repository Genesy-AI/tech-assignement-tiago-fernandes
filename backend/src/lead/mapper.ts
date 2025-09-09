// IMPROVEMENT: Interfaces and DTOs to a different layer
// IMPROVEMENT: Lead as a Class with methods to validate
import { Lead } from './types'

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
      return mapToLead(lead)
    })
    .filter((lead) => !!lead)

  return validLeads
}

/**
 * validates and maps raw lead input to Lead
 * @param lead
 * @returns Lead or null if not valid
 */
export function mapToLead(lead: any): Lead | null {
  if (!isValidLead(lead)) {
    return null
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
  // optional fields
  // IMPROVEMENT: make this more DRY
  // if the optional fields are present, they should be strings and not null or undefined
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
