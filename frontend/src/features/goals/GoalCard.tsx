import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import type { Goal } from '../../types'
import { useMilestones } from '../milestones'
import { useUpdateGoal } from './useGoals'

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
  const updateGoal = useUpdateGoal()
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

  function handleToggleComplete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed'
    updateGoal.mutate({ id: goal.id, data: { status: newStatus } })
  }

  const isCompleted = goal.status === 'completed'

  return (
    <div className="group relative">
      <Link
        to={`/goals/${goal.id}`}
        className={`block rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
          isCompleted
            ? 'border-green-300 ring-1 ring-green-200'
            : 'border-gray-200'
        }`}
      >
        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1 shadow-md">
            <CheckCircleSolidIcon className="h-5 w-5 text-white" />
          </div>
        )}

        <div className="flex items-start justify-between">
          <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
            {goal.title}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[goal.status]}`}
          >
            {statusLabels[goal.status]}
          </span>
        </div>

        <p className={`mt-2 line-clamp-2 text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
          {goal.description}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>進捗</span>
            <span>
              {completedMilestones}/{totalMilestones} マイルストーン
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : 'bg-indigo-600'
              }`}
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

      {/* Quick Complete Button */}
      <button
        type="button"
        onClick={handleToggleComplete}
        disabled={updateGoal.isPending}
        className={`absolute bottom-4 right-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium opacity-0 transition-all group-hover:opacity-100 ${
          isCompleted
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-green-500 text-white shadow-md hover:bg-green-600'
        }`}
        title={isCompleted ? '進行中に戻す' : '完了にする'}
      >
        {updateGoal.isPending ? (
          <span className="animate-pulse">...</span>
        ) : isCompleted ? (
          <>
            <CheckCircleIcon className="h-3.5 w-3.5" />
            戻す
          </>
        ) : (
          <>
            <CheckCircleSolidIcon className="h-3.5 w-3.5" />
            完了
          </>
        )}
      </button>
    </div>
  )
}
