import { Filters, Status, Priority } from '../types'

interface FilterBarProps {
  filters: Filters
  categories: string[]
  onChange: (filters: Filters) => void
}

const statusOptions: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const priorityOptions: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function FilterBar({ filters, categories, onChange }: FilterBarProps) {
  const handleStatusChange = (status: Status | 'all') => {
    onChange({ ...filters, status })
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priority: e.target.value as Priority | 'all' })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value })
  }

  const handleSearchClear = () => {
    onChange({ ...filters, search: '' })
  }

  return (
    <div className="filter-bar">
      <div className="status-tabs">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            className={`status-tab${filters.status === opt.value ? ' active' : ''}`}
            onClick={() => handleStatusChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <select
        className="priority-select"
        value={filters.priority}
        onChange={handlePriorityChange}
      >
        {priorityOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {categories.length > 0 && (
        <select
          className="priority-select"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      <div className="search-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search todos..."
          value={filters.search}
          onChange={handleSearchChange}
        />
        {filters.search && (
          <button className="search-clear" onClick={handleSearchClear} aria-label="Clear search">
            &times;
          </button>
        )}
      </div>
    </div>
  )
}
