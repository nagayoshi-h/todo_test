import { Filters, Todo, TodoPayload, Stats, Status } from './types'

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL === 'true'
const STORAGE_KEY = 'todo_app_todos'
const CYCLE: Record<Status, Status> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

// ── localStorage helpers ─────────────────────────────────────────────────────

function loadLocal(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Todo[]
  } catch {
    return []
  }
}

function saveLocal(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

// ── localStorage implementations ─────────────────────────────────────────────

function localFetchTodos(filters: Filters): Todo[] {
  let todos = loadLocal()
  if (filters.status !== 'all') todos = todos.filter((t) => t.status === filters.status)
  if (filters.priority !== 'all') todos = todos.filter((t) => t.priority === filters.priority)
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    todos = todos.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    )
  }
  return todos.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

function localCreateTodo(payload: TodoPayload): Todo {
  const now = new Date().toISOString()
  const todo: Todo = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: 'pending',
    priority: payload.priority || 'medium',
    category: payload.category.trim(),
    due_date: payload.due_date || null,
    created_at: now,
    updated_at: now,
  }
  const todos = loadLocal()
  todos.push(todo)
  saveLocal(todos)
  return todo
}

function localUpdateTodo(id: string, payload: Partial<TodoPayload>): Todo {
  const todos = loadLocal()
  const idx = todos.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Todo not found')
  const todo = todos[idx]
  if (payload.title !== undefined) todo.title = payload.title.trim()
  if (payload.description !== undefined) todo.description = payload.description.trim()
  if (payload.priority !== undefined) todo.priority = payload.priority
  if (payload.category !== undefined) todo.category = payload.category.trim()
  if (payload.due_date !== undefined) todo.due_date = payload.due_date || null
  todo.updated_at = new Date().toISOString()
  saveLocal(todos)
  return todo
}

function localCycleStatus(id: string): Todo {
  const todos = loadLocal()
  const todo = todos.find((t) => t.id === id)
  if (!todo) throw new Error('Todo not found')
  todo.status = CYCLE[todo.status]
  todo.updated_at = new Date().toISOString()
  saveLocal(todos)
  return todo
}

function localDeleteTodo(id: string): void {
  const todos = loadLocal()
  const idx = todos.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Todo not found')
  todos.splice(idx, 1)
  saveLocal(todos)
}

function localFetchCategories(): string[] {
  return [...new Set(loadLocal().map((t) => t.category).filter(Boolean))].sort()
}

function localFetchStats(): Stats {
  const todos = loadLocal()
  const today = new Date().toISOString().split('T')[0]
  return {
    total: todos.length,
    pending: todos.filter((t) => t.status === 'pending').length,
    in_progress: todos.filter((t) => t.status === 'in_progress').length,
    completed: todos.filter((t) => t.status === 'completed').length,
    overdue: todos.filter(
      (t) => t.status !== 'completed' && t.due_date != null && t.due_date < today
    ).length,
  }
}

// ── HTTP API implementations ──────────────────────────────────────────────────

const BASE_URL = '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Request failed (${res.status}): ${errorText}`)
  }
  return res.json() as Promise<T>
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchTodos(filters: Filters): Promise<Todo[]> {
  if (USE_LOCAL) return Promise.resolve(localFetchTodos(filters))
  const params = new URLSearchParams()
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.priority !== 'all') params.set('priority', filters.priority)
  if (filters.search.trim()) params.set('search', filters.search.trim())
  const query = params.toString() ? `?${params.toString()}` : ''
  return handleResponse<Todo[]>(await fetch(`${BASE_URL}/todos${query}`))
}

export async function createTodo(payload: TodoPayload): Promise<Todo> {
  if (USE_LOCAL) return Promise.resolve(localCreateTodo(payload))
  return handleResponse<Todo>(
    await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  )
}

export async function updateTodo(id: string, payload: Partial<TodoPayload>): Promise<Todo> {
  if (USE_LOCAL) return Promise.resolve(localUpdateTodo(id, payload))
  return handleResponse<Todo>(
    await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  )
}

export async function cycleStatus(id: string): Promise<Todo> {
  if (USE_LOCAL) return Promise.resolve(localCycleStatus(id))
  return handleResponse<Todo>(
    await fetch(`${BASE_URL}/todos/${id}/cycle`, { method: 'PATCH' })
  )
}

export async function deleteTodo(id: string): Promise<void> {
  if (USE_LOCAL) return Promise.resolve(localDeleteTodo(id))
  const res = await fetch(`${BASE_URL}/todos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed (${res.status})`)
}

export async function fetchCategories(): Promise<string[]> {
  if (USE_LOCAL) return Promise.resolve(localFetchCategories())
  return handleResponse<string[]>(await fetch(`${BASE_URL}/todos/categories`))
}

export async function fetchStats(): Promise<Stats> {
  if (USE_LOCAL) return Promise.resolve(localFetchStats())
  return handleResponse<Stats>(await fetch(`${BASE_URL}/todos/stats`))
}
