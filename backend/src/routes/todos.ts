import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { load, save, TodoRecord } from '../db'

const router = Router()

const VALID_STATUSES = new Set(['pending', 'in_progress', 'completed'])
const VALID_PRIORITIES = new Set(['low', 'medium', 'high'])
const CYCLE: Record<string, string> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

// GET /categories
router.get('/categories', (_req: Request, res: Response) => {
  const { todos } = load()
  const cats = [...new Set(todos.map((t) => t.category).filter(Boolean))].sort()
  res.json(cats)
})

// GET /stats
router.get('/stats', (_req: Request, res: Response) => {
  const { todos } = load()
  const today = new Date().toISOString().split('T')[0]
  res.json({
    total: todos.length,
    pending: todos.filter((t) => t.status === 'pending').length,
    in_progress: todos.filter((t) => t.status === 'in_progress').length,
    completed: todos.filter((t) => t.status === 'completed').length,
    overdue: todos.filter(
      (t) => t.status !== 'completed' && t.due_date != null && t.due_date < today
    ).length,
  })
})

// GET /
router.get('/', (req: Request, res: Response) => {
  const { status, priority, category, search } = req.query as Record<string, string>
  let { todos } = load()

  if (status && status !== 'all') todos = todos.filter((t) => t.status === status)
  if (priority && priority !== 'all') todos = todos.filter((t) => t.priority === priority)
  if (category && category !== 'all' && category !== '')
    todos = todos.filter((t) => t.category === category)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    todos = todos.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    )
  }

  todos.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  res.json(todos)
})

// POST /
router.post('/', (req: Request, res: Response) => {
  const { title, description, priority, category, due_date } = req.body as Record<string, string>

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const now = new Date().toISOString()
  const todo: TodoRecord = {
    id: uuidv4(),
    title: title.trim(),
    description: (description || '').trim(),
    status: 'pending',
    priority: VALID_PRIORITIES.has(priority) ? priority : 'medium',
    category: (category || '').trim(),
    due_date: due_date || null,
    created_at: now,
    updated_at: now,
  }

  const db = load()
  db.todos.push(todo)
  save(db)
  return res.status(201).json(todo)
})

// PUT /:id
router.put('/:id', (req: Request, res: Response) => {
  const db = load()
  const idx = db.todos.findIndex((t) => t.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' })

  const todo = db.todos[idx]
  const body = req.body as Partial<TodoRecord>

  if (body.title !== undefined) {
    if (!body.title.trim()) return res.status(400).json({ error: 'Title cannot be empty' })
    todo.title = body.title.trim()
  }
  if (body.description !== undefined) todo.description = body.description.trim()
  if (body.status !== undefined && VALID_STATUSES.has(body.status)) todo.status = body.status
  if (body.priority !== undefined && VALID_PRIORITIES.has(body.priority)) todo.priority = body.priority
  if (body.category !== undefined) todo.category = body.category.trim()
  if (body.due_date !== undefined) todo.due_date = body.due_date || null
  todo.updated_at = new Date().toISOString()

  save(db)
  return res.json(todo)
})

// PATCH /:id/cycle
router.patch('/:id/cycle', (req: Request, res: Response) => {
  const db = load()
  const todo = db.todos.find((t) => t.id === req.params.id)
  if (!todo) return res.status(404).json({ error: 'Todo not found' })

  todo.status = CYCLE[todo.status] ?? 'pending'
  todo.updated_at = new Date().toISOString()
  save(db)
  return res.json(todo)
})

// DELETE /:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = load()
  const idx = db.todos.findIndex((t) => t.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' })

  db.todos.splice(idx, 1)
  save(db)
  return res.status(204).send()
})

export default router
