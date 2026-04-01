import { Filters, Todo, TodoPayload, Stats } from './types'

const BASE_URL = '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Request failed (${res.status}): ${errorText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchTodos(filters: Filters): Promise<Todo[]> {
  const params = new URLSearchParams()

  if (filters.status !== 'all') {
    params.set('status', filters.status)
  }
  if (filters.priority !== 'all') {
    params.set('priority', filters.priority)
  }
  if (filters.search.trim() !== '') {
    params.set('search', filters.search.trim())
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${BASE_URL}/todos${query}`)
  return handleResponse<Todo[]>(res)
}

export async function createTodo(payload: TodoPayload): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<Todo>(res)
}

export async function updateTodo(id: string, payload: Partial<TodoPayload>): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<Todo>(res)
}

export async function cycleStatus(id: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}/cycle`, {
    method: 'PATCH',
  })
  return handleResponse<Todo>(res)
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Delete failed (${res.status}): ${errorText}`)
  }
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/todos/categories`)
  return handleResponse<string[]>(res)
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE_URL}/todos/stats`)
  return handleResponse<Stats>(res)
}
