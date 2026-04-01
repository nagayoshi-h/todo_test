import { Todo, TodoPayload } from '../types'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onCycle: (id: string) => Promise<void>
  onUpdate: (id: string, payload: Partial<TodoPayload>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function TodoList({ todos, loading, onCycle, onUpdate, onDelete }: TodoListProps) {
  if (loading) {
    return (
      <div className="todo-list-state">
        <div className="spinner" />
        <span>Loading todos...</span>
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="todo-list-state">
        <p className="empty-state">No todos found.</p>
      </div>
    )
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onCycle={onCycle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
