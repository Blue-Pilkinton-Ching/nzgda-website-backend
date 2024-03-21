import express, { Request, Response, Router } from 'express'
import cors from 'cors'
import privilege from './authenticate'

const app = express()
const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})

app.use(cors())

const dashboard = Router()
dashboard.use(privilege)

app.use('/dashboard', dashboard)

dashboard.get('/', (req: Request, res: Response) => {
  res.send('Heihei dashboard api backend!')
})

app.get('/', (req: Request, res: Response) => {
  res.send('Heihei website api backend!')
})

export { dashboard }
