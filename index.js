import express from 'express'
import cors from 'cors'

const app = express()

const PORT = process.env.PORT || 3002

app.use(cors())

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
