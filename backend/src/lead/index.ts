// DTO 
export interface Lead {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string | null
  companyName?: string | null
  countryCode?: string | null
  phoneNumber?: string | null
  yearsAtCompany?: string | null
  linkedinProfile?: string | null
}


// map DTO to LEadmModel 
export function mapToLead(lead: any): Lead {
  if (!isValidLead(lead) ) {
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
  if (!!lead.companyName && typeof lead.companyName !== 'string') { return false }
  if (!!lead.countryCode && typeof lead.countryCode !== 'string') { return false }
  if (!!lead.phoneNumber && typeof lead.phoneNumber !== 'string') { return false }
  if (!!lead.yearsAtCompany && typeof lead.yearsAtCompany !== 'string') { return false }
  if (!!lead.linkedinProfile && typeof lead.linkedinProfile !== 'string') { return false }
  
  return typeof lead.firstName === 'string' &&
    typeof lead.lastName === 'string' &&
    typeof lead.email === 'string' &&
    lead.firstName &&
    lead.lastName &&
    lead.email && isValidEmail(lead.email.trim()) // the most expensive calculation goes last
    
}