export type LeadModel = {
  id: number
  createdAt: Date
  updatedAt: Date
  firstName: string
  lastName: string
  email: string
  jobTitle: string | null
  companyName: string | null
  countryCode: string | null
  phoneNumber: string | null
  yearsAtCompany: string | null
  linkedinProfile: string | null
}
