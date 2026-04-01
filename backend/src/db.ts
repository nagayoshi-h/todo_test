import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(__dirname, '../../todos.json')

export interface TodoRecord {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  due_date: string | null
  created_at: string
  updated_at: string
}

interface Database {
  todos: TodoRecord[]
}

export function load(): Database {
  if (!fs.existsSync(DB_FILE)) {
    return { todos: [] }
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as Database
  } catch {
    return { todos: [] }
  }
}

export function save(data: Database): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
}
