import express, { Request, Response, Router } from 'express'
import cors from 'cors'
import { dashboard } from './routes/dashboard'

const app = express()
const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})

app.use(cors())
app.use(express.json())
app.use(express.text())

app.use('/dashboard', dashboard)

app.get('/', (req: Request, res: Response) => {
  res.send('Heihei website api backend!')
})
