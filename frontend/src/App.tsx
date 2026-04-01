import { useState, useEffect, useCallback } from 'react'
import { Todo, Stats, Filters, TodoPayload } from './types'
import {
  fetchTodos,
  fetchStats,
  fetchCategories,
  createTodo,
  updateTodo,
  cycleStatus,
  deleteTodo,
} from './api'
import StatsPanel from './components/StatsPanel'
import AddTodo from './components/AddTodo'
import FilterBar from './components/FilterBar'
import TodoList from './components/TodoList'

const defaultFilters: Filters = {
  status: 'all',
  priority: 'all',
  search: '',
}

const defaultStats: Stats = {
  total: 0,
  pending: 0,
  in_progress: 0,
  completed: 0,
  overdue: 0,
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTodosAndStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [todosData, statsData] = await Promise.all([
        fetchTodos(filters),
        fetchStats(),
      ])
      setTodos(todosData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadCategories = useCallback(async () => {
    try {
      const cats = await fetchCategories()
      setCategories(cats)
    } catch {
      // silently fail for categories
    }
  }, [])

  useEffect(() => {
    loadTodosAndStats()
  }, [loadTodosAndStats])

  useEffect(() => {
    loadCategories()
  }, [loadCategories, todos])

  const handleAdd = async (payload: TodoPayload) => {
    try {
      await createTodo(payload)
      await loadTodosAndStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
    }
  }

  const handleCycle = async (id: string) => {
    try {
      await cycleStatus(id)
      await loadTodosAndStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo status')
    }
  }

  const handleUpdate = async (id: string, payload: Partial<TodoPayload>) => {
    try {
      await updateTodo(id, payload)
      await loadTodosAndStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id)
      await loadTodosAndStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">
            &times;
          </button>
        </div>
      )}

      <StatsPanel stats={stats} />

      <AddTodo categories={categories} onAdd={handleAdd} />

      <FilterBar filters={filters} categories={categories} onChange={setFilters} />

      <TodoList
        todos={todos}
        loading={loading}
        onCycle={handleCycle}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
