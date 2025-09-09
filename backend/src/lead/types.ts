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
/**
 * Results of the create leads operation
 * @param errors - array of errors
 * @param importedCount - number of imported leads
 */
// TODO LeadCreationResults
export type LeadResults = {
  errors: LeadError[]
  importedCount: number
}

/**
 * Error object for a lead
 * @param error - error message
 * @param lead - lead object
 */
export type LeadError = { error: string; lead: Lead }
// TODO LeadCreationResult 