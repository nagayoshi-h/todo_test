import { useState } from 'react'
import { Todo, TodoPayload, Priority } from '../types'

interface TodoItemProps {
  todo: Todo
  onCycle: (id: string) => Promise<void>
  onUpdate: (id: string, payload: Partial<TodoPayload>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.status === 'completed') return false
  const today = new Date().toISOString().split('T')[0]
  return todo.due_date < today
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${month}/${day}/${year}`
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export default function TodoItem({ todo, onCycle, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: todo.title,
    description: todo.description,
    priority: todo.priority as Priority,
    category: todo.category,
    due_date: todo.due_date || '',
  })
  const [saving, setSaving] = useState(false)

  const overdue = isOverdue(todo)

  const handleEditToggle = () => {
    setForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      category: todo.category,
      due_date: todo.due_date || '',
    })
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await onUpdate(todo.id, form)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete "${todo.title}"?`)) {
      await onDelete(todo.id)
    }
  }

  const handleCycle = async () => {
    await onCycle(todo.id)
  }

  if (editing) {
    return (
      <div className="todo-card todo-card-editing">
        <form onSubmit={handleSave} className="edit-form">
          <div className="edit-form-grid">
            <div className="form-group form-group-full">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group form-group-full">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Category"
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="edit-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={`todo-card${todo.status === 'completed' ? ' todo-completed' : ''}`}>
      <div className="todo-card-left">
        <button
          className={`status-btn status-btn--${todo.status}`}
          onClick={handleCycle}
          title="Click to change status"
        >
          {statusLabels[todo.status] || todo.status}
        </button>
        <div className="todo-content">
          <span className={`todo-title${todo.status === 'completed' ? ' todo-title--done' : ''}`}>
            {todo.title}
          </span>
          {todo.description && (
            <p className="todo-description">
              {todo.description.length > 100
                ? `${todo.description.slice(0, 100)}...`
                : todo.description}
            </p>
          )}
          <div className="todo-meta">
            <span className={`priority-badge priority-badge--${todo.priority}`}>
              {todo.priority}
            </span>
            {todo.category && (
              <span className="category-badge">{todo.category}</span>
            )}
            {todo.due_date && (
              <span className={`due-date${overdue ? ' due-date--overdue' : ''}`}>
                Due: {formatDate(todo.due_date)}
                {overdue && ' (overdue)'}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="todo-card-actions">
        <button className="action-btn action-btn--edit" onClick={handleEditToggle} title="Edit">
          Edit
        </button>
        <button className="action-btn action-btn--delete" onClick={handleDelete} title="Delete">
          Delete
        </button>
      </div>
    </div>
  )
}
