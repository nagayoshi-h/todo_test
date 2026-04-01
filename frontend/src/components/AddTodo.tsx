import { useState } from 'react'
import { TodoPayload, Priority } from '../types'

interface AddTodoProps {
  categories: string[]
  onAdd: (payload: TodoPayload) => Promise<void>
}

const defaultForm: TodoPayload = {
  title: '',
  description: '',
  priority: 'medium',
  category: '',
  due_date: '',
}

export default function AddTodo({ categories, onAdd }: AddTodoProps) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState<TodoPayload>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = () => {
    setExpanded((prev) => !prev)
    setError(null)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onAdd(form)
      setForm(defaultForm)
      setExpanded(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setForm(defaultForm)
    setExpanded(false)
    setError(null)
  }

  return (
    <div className="add-todo">
      <button className="add-todo-toggle" onClick={handleToggle}>
        {expanded ? '- Cancel' : '+ New Todo'}
      </button>

      {expanded && (
        <form className="add-todo-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add details..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Work, Personal"
                list="categories-datalist"
              />
              <datalist id="categories-datalist">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                id="due_date"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Todo'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
