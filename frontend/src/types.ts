export type Status = 'pending' | 'in_progress' | 'completed'
export type Priority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  category: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Filters {
  status: Status | 'all'
  priority: Priority | 'all'
  search: string
}

export interface Stats {
  total: number
  pending: number
  in_progress: number
  completed: number
  overdue: number
}

export interface TodoPayload {
  title: string
  description: string
  priority: Priority
  category: string
  due_date: string
}
