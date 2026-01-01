import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useGoal, useUpdateGoal, useDeleteGoal } from './useGoals'
import { GoalFormModal } from './GoalFormModal'
import { MilestoneList, GanttChart, ProgressChart, useMilestones } from '../milestones'
import { styles } from '../../lib/styles'
import type { UpdateGoalInput, GoalStatus } from '../../types'

const statusColors: Record<GoalStatus, string> = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
}

const statusLabels: Record<GoalStatus, string> = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
  on_hold: '保留',
}

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'gantt' | 'progress'>('list')

  const { data: goal, isLoading, error } = useGoal(id || '')
  const { data: milestones } = useMilestones(id || '')
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  function handleUpdateGoal(data: UpdateGoalInput) {
    if (!id) return
    updateGoal.mutate(
      { id, data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
        },
      }
    )
  }

  async function handleDeleteGoal() {
    if (!id) return
    if (!window.confirm('この目標を削除しますか？関連するマイルストーンも削除されます。')) {
      return
    }
    setIsDeleting(true)
    deleteGoal.mutate(id, {
      onSuccess: () => {
        navigate('/')
      },
      onSettled: () => {
        setIsDeleting(false)
      },
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !goal) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">目標が見つかりませんでした</p>
        <Link to="/" className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-500">
          目標一覧に戻る
        </Link>
      </div>
    )
  }

  const completedMilestones = (milestones || []).filter((m) => m.status === 'completed').length
  const totalMilestones = (milestones || []).length
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          目標一覧に戻る
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
            <span
              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[goal.status]}`}
            >
              {statusLabels[goal.status]}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setIsEditModalOpen(true)}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={handleDeleteGoal}
              disabled={isDeleting}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-gray-600">{goal.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">開始日:</span>
            <span className="ml-2 font-medium">{formatDate(goal.startDate)}</span>
          </div>
          <div>
            <span className="text-gray-500">終了日:</span>
            <span className="ml-2 font-medium">{formatDate(goal.endDate)}</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">進捗率</span>
            <span className="font-medium">
              {Math.round(progress)}% ({completedMilestones}/{totalMilestones} マイルストーン)
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`border-b-2 px-1 pb-4 text-sm font-medium ${
                activeTab === 'list'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              リスト表示
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gantt')}
              className={`border-b-2 px-1 pb-4 text-sm font-medium ${
                activeTab === 'gantt'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              ガントチャート
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className={`border-b-2 px-1 pb-4 text-sm font-medium ${
                activeTab === 'progress'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              進捗グラフ
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'list' && (
            <MilestoneList goalId={goal.id} goalEndDate={goal.endDate} />
          )}
          {activeTab === 'gantt' && <GanttChart goal={goal} />}
          {activeTab === 'progress' && (
            <ProgressChart goal={goal} milestones={milestones || []} />
          )}
        </div>
      </div>

      <GoalFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateGoal}
        goal={goal}
        isLoading={updateGoal.isPending}
      />
    </div>
  )
}
