import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGoals, useCreateGoal } from './useGoals'
import { GoalCard } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { styles } from '../../lib/styles'
import type { CreateGoalInput } from '../../types'

export function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: goals, isLoading, error } = useGoals()
  const createGoal = useCreateGoal()

  function handleCreateGoal(data: CreateGoalInput) {
    createGoal.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">
          エラーが発生しました: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">目標一覧</h1>
        <button type="button" className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          新しい目標
        </button>
      </div>

      {goals && goals.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">目標がありません</h3>
          <p className="mt-1 text-sm text-gray-500">新しい目標を作成して始めましょう</p>
          <div className="mt-6">
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setIsModalOpen(true)}
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              新しい目標を作成
            </button>
          </div>
        </div>
      )}

      <GoalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGoal}
        isLoading={createGoal.isPending}
      />
    </div>
  )
}
