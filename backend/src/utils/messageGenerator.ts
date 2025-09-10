import { LeadModel } from '../lead/model'

export function generateMessageFromTemplate(template: string, lead: LeadModel): string {
  let message = template

  // key fields that can be replaced in the template for a value.
  const replaceableKeyFields = {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    jobTitle: lead.jobTitle,
    companyName: lead.companyName,
    countryCode: lead.countryCode,
    phoneNumber: lead.phoneNumber,
    yearsAtCompany: lead.yearsAtCompany,
    linkedinProfile: lead.linkedinProfile,
  }

  // This regex will match anything that the USER provides,
  // vs the fields that are available from our business logic.
  // Should we invert the logic e.g. find for {validField} instead of {userMadeUpField}?
  const templateVariables = template.match(/\{(\w+)\}/g) || []
  for (const variable of templateVariables) {
    const fieldName = variable.slice(1, -1)

    if (fieldName in replaceableKeyFields) {
      const fieldValue = replaceableKeyFields[fieldName as keyof typeof replaceableKeyFields]

      if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
        throw new Error(`Missing required field: ${fieldName}`)
      }

      message = message.replace(new RegExp(`\\{${fieldName}\\}`, 'g'), fieldValue)
    } else {
      throw new Error(`Unknown field in template: ${fieldName}`)
    }
  }

  return message
}
