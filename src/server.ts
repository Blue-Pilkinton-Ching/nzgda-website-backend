import express, { Request, Response } from 'express'
import cors from 'cors'

import multer from 'multer'

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))

// const storage = multer.memoryStorage() // Use memory storage for simplicity
const upload = multer({ dest: 'uploads/' })

export { upload as multer }

import { dashboard } from './routes/dashboard'

app.use('/dashboard', dashboard)

app.get('/', (req: Request, res: Response) => {
  res.send('Heihei website api backend!')
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
