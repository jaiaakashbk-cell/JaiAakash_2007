require('dotenv').config()

const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
const port = Number(process.env.PORT) || 5000
const companies = ['HCLTech', 'TCS', 'Wipro', 'Infosys']
const registrationSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  course: { type: String, required: true },
  gender: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  backlogs: { type: Number, required: true, min: 0 },
  company: { type: String, required: true, enum: companies },
}, { timestamps: true })

const Registration = mongoose.model('Registration', registrationSchema)

app.use(cors())
app.use(express.json())

app.get('/', (_request, response) => {
  response.json({
    message: 'Student registration API is running',
    health: '/api/health',
    registrations: '/api/registrations',
  })
})

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'student-registration-api' })
})

app.get('/api/registrations', async (request, response) => {
  const company = request.query.company
  try {
    const filter = company ? { company } : {}
    const result = await Registration.find(filter).sort({ createdAt: -1 }).lean()
    response.json(result)
  } catch (error) {
    response.status(500).json({ message: 'Could not load registrations' })
  }
})

app.post('/api/registrations', async (request, response) => {
  const registration = request.body
  const requiredFields = ['studentName', 'rollNo', 'bloodGroup', 'phone', 'email', 'address', 'department', 'course', 'gender', 'year', 'section', 'backlogs', 'company']
  const missingField = requiredFields.find((field) => registration[field] === undefined || registration[field] === '')

  if (missingField) {
    return response.status(400).json({ message: `${missingField} is required` })
  }

  if (Number(registration.backlogs) !== 0) {
    return response.status(400).json({ message: 'Only students with zero backlogs can register for a company' })
  }

  if (!companies.includes(registration.company)) {
    return response.status(400).json({ message: 'Choose a valid company' })
  }

  try {
    const savedRegistration = await Registration.create({ ...registration, backlogs: Number(registration.backlogs) })
    return response.status(201).json(savedRegistration)
  } catch (error) {
    return response.status(500).json({ message: 'Could not save registration' })
  }
})

async function startServer() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured')
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')
  app.listen(port, () => console.log(`Student registration API running on http://localhost:${port}`))
}

startServer().catch((error) => {
  console.error('Server startup failed:', error.message)
  process.exitCode = 1
})
