import { Stats } from '../types'

interface StatsPanelProps {
  stats: Stats
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="stats-panel">
      <div className="stat-card">
        <span className="stat-number">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat-card">
        <span className="stat-number">{stats.pending}</span>
        <span className="stat-label">Pending</span>
      </div>
      <div className="stat-card">
        <span className="stat-number">{stats.in_progress}</span>
        <span className="stat-label">In Progress</span>
      </div>
      <div className="stat-card">
        <span className="stat-number">{stats.completed}</span>
        <span className="stat-label">Completed</span>
      </div>
      <div className="stat-card">
        <span className={`stat-number${stats.overdue > 0 ? ' stat-overdue' : ''}`}>
          {stats.overdue}
        </span>
        <span className={`stat-label${stats.overdue > 0 ? ' stat-overdue' : ''}`}>
          Overdue
        </span>
      </div>
    </div>
  )
}
