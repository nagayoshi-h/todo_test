import express from 'express'
import cors from 'cors'
import todosRouter from './routes/todos'

const app = express()
const PORT = 3001

// Enable CORS for all origins
app.use(cors())

// Parse JSON bodies
app.use(express.json())

// Mount todos router at /api/todos
app.use('/api/todos', todosRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
