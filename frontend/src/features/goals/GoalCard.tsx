import { Link } from 'react-router-dom'
import type { Goal } from '../../types'
import { useMilestones } from '../milestones'

interface GoalCardProps {
  goal: Goal
}

const statusColors = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
}

const statusLabels = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
  on_hold: '保留',
}

export function GoalCard({ goal }: GoalCardProps) {
  const { data: milestones } = useMilestones(goal.id)
  const completedMilestones = (milestones || []).filter((m) => m.status === 'completed').length
  const totalMilestones = (milestones || []).length
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Link
      to={`/goals/${goal.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[goal.status]}`}
        >
          {statusLabels[goal.status]}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{goal.description}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>進捗</span>
          <span>
            {completedMilestones}/{totalMilestones} マイルストーン
          </span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(goal.startDate)}</span>
        <span>→</span>
        <span>{formatDate(goal.endDate)}</span>
      </div>
    </Link>
  )
}
