export type LeadsGenerateMessagesInput = {
  leadIds: number[]
  template: string
}

export type LeadsGenerateMessagesOutput = {
  success: boolean
  generatedCount: number
  errors: Array<{
    leadId: number
    leadName: string
    error: string
  }>
}
