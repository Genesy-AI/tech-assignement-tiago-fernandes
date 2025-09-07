import { PrismaClient } from '@prisma/client'
import express, { NextFunction, Request, Response } from 'express'
import { generateMessageFromTemplate } from './utils/messageGenerator'
import { isValidLead, Lead, mapToLead } from './lead'
import { LeadModel } from './lead/model'

const prisma = new PrismaClient()
const app = express()
app.use(express.json())


// IMPROVEMENT: segregate controller logic from routes logic.
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }

  next()
})

// IMPROVEMENT: move this to a middleware folder
const jsonValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body is required and must be valid JSON' })
  }
  next()
}

app.post('/leads', async (req: Request, res: Response) => {
  const { name, lastName, email } = req.body

  if (!name || !lastName || !email) {
    return res.status(400).json({ error: 'firstName, lastName, and email are required' })
  }

  const lead = await prisma.lead.create({
    data: {
      firstName: String(name),
      lastName: String(lastName),
      email: String(email),
    },
  })
  res.json(lead)
})

app.get('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const lead = await prisma.lead.findUnique({
    where: {
      id: Number(id),
    },
  })
  res.json(lead)
})

app.get('/leads', async (req: Request, res: Response) => {
  const leads = await prisma.lead.findMany()

  res.json(leads)
})

app.patch('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, email } = req.body
  const lead = await prisma.lead.update({
    where: {
      id: Number(id),
    },
    data: {
      firstName: String(name),
      email: String(email),
    },
  })
  res.json(lead)
})

app.delete('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  await prisma.lead.delete({
    where: {
      id: Number(id),
    },
  })
  res.json()
})

app.delete('/leads', jsonValidatorMiddleware, async (req: Request, res: Response) => {
  const { ids } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' })
  }

  try {
    const result = await prisma.lead.deleteMany({
      where: {
        id: {
          in: ids.map((id) => Number(id)),
        },
      },
    })

    res.json({ deletedCount: result.count })
  } catch (error) {
    console.error('Error deleting leads:', error)
    res.status(500).json({ error: 'Failed to delete leads' })
  }
})

app.post('/leads/generate-messages', jsonValidatorMiddleware, async (req: Request, res: Response) => {
  const { leadIds, template } = req.body

  // IMPROVEMENT: validation + throw custom error class. (validation middleware? not sure as it might be business logic)
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ error: 'leadIds must be a non-empty array' })
  }

  if (!template || typeof template !== 'string') {
    return res.status(400).json({ error: 'template must be a non-empty string' })
  }

  try {
    // TODO type the DB model
    const leads = await prisma.lead.findMany({
      where: {
        id: {
          in: leadIds.map((id) => Number(id)),
        },
      },
    })

    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found with the provided IDs' })
    }

    let generatedCount = 0
    const errors: Array<{ leadId: number; leadName: string; error: string }> = []

    for (const lead of leads) {
      try {
        const message = generateMessageFromTemplate(template, lead)
        // IMPROVEMENT:parallelise it make this loops async, do a promise.all to update all in parallel
        await prisma.lead.update({
          where: { id: lead.id }, // id is part of the leadDBmodel
          data: { message },
        })

        generatedCount++
      } catch (error) {
        errors.push({
          leadId: lead.id,
          leadName: `${lead.firstName} ${lead.lastName}`.trim(),
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    res.json({
      success: true,
      generatedCount,
      errors,
    })
  } catch (error) {
    console.error('Error generating messages:', error)
    res.status(500).json({ error: 'Failed to generate messages' })
  }
})

app.post('/leads/bulk', jsonValidatorMiddleware, async (req: Request, res: Response) => {
  const { leads } = req.body

  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ error: 'leads must be a non-empty array' })
  }

  try {
    // IMPROVEMENT: input validation extra step regardless of the frontend validation?
    
    const validLeads : Lead[] = leads.map((lead) => {
      try {
        return mapToLead(lead)
      } catch (error) {
        // TODO remove these logs
        // how should we log the invalid leads? 
        console.log('lead', lead)
        console.error('Error mapping lead:', error)
        return null
      }
    }).filter((lead) => !!lead)

    if (validLeads.length === 0) {
      return res
        .status(400)
        .json({ error: 'No valid leads found. firstName, lastName, and email are required.' })
    }

    // IMPRovement: LeadRepository abstraction
    const existingLeads: LeadModel[] = await prisma.lead.findMany({
      where: {
        OR: validLeads.map((lead) => ({
          AND: [{ firstName: lead.firstName.trim() }, { lastName: lead.lastName.trim() }],
        })),
      },
    })
    
    console.log('existingLeads', existingLeads)

    const leadKeys = new Set(
      existingLeads.map((lead) => `${lead.firstName.toLowerCase()}_${(lead.lastName || '').toLowerCase()}`)
    )

    console.log('leadKeys', leadKeys)

    const uniqueLeads = validLeads.filter((lead) => {
      const key = `${lead.firstName.toLowerCase()}_${lead.lastName?.toLowerCase()}`
      return !leadKeys.has(key)
    })

    console.log('uniqueLeads', uniqueLeads)

    let importedCount = 0
    const errors: Array<{ lead: Lead; error: string }> = []
    // IMPROVEMENT: parallelise it make this loops async, do a promise.all to create all in parallel
    for (const lead of uniqueLeads) {
      try {
        await prisma.lead.create({
          data: {...lead},
        })
        importedCount++
      } catch (error) {
        errors.push({
          lead: lead,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    res.json({
      success: true,
      importedCount,
      duplicatesSkipped: validLeads.length - uniqueLeads.length,
      invalidLeads: leads.length - validLeads.length,
      errors,
    })
  } catch (error) {
    console.error('Error importing leads:', error)
    res.status(500).json({ error: 'Failed to import leads' })
  }
})

app.listen(4000, () => {
  console.log('Express server is running on port 4000')
})



// for (const lead of uniqueLeads) {
    //   try {
    //     await prisma.lead.create({
    //       data: {
    //         firstName: lead.firstName.trim(),
    //         lastName: lead.lastName!.trim(),
    //         email: lead.email!.trim(),
    //         jobTitle: lead.jobTitle ? lead.jobTitle.trim() : null,
    //         countryCode: lead.countryCode ? lead.countryCode.trim() : null,
    //         companyName: lead.companyName ? lead.companyName.trim() : null,
    //         phoneNumber: lead.phoneNumber ? lead.phoneNumber.trim() : null,
    //         yearsAtCompany: lead.yearsAtCompany ? lead.yearsAtCompany.trim() : null,
    //         linkedinProfile: lead.linkedinProfile ? lead.linkedinProfile.trim() : null,
    //       },
    //     })
    //     importedCount++
    //   } catch (error) {
    //     errors.push({
    //       lead: lead,
    //       error: error instanceof Error ? error.message : 'Unknown error',
    //     })
    //   }
    // }