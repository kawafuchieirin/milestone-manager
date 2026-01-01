import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { styles } from '../../lib/styles'
import type { Goal, CreateGoalInput } from '../../types'

interface GoalFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateGoalInput) => void
  goal?: Goal | null
  isLoading?: boolean
}

export function GoalFormModal({ isOpen, onClose, onSubmit, goal, isLoading }: GoalFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setDescription(goal.description)
      setStartDate(goal.startDate)
      setEndDate(goal.endDate)
    } else {
      setTitle('')
      setDescription('')
      setStartDate('')
      setEndDate('')
    }
    setError('')
  }, [goal, isOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (new Date(startDate) > new Date(endDate)) {
      setError('開始日は終了日より前に設定してください')
      return
    }

    onSubmit({ title, description, startDate, endDate })
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {goal ? '目標を編集' : '新しい目標を作成'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      タイトル
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`mt-1 ${styles.inputField}`}
                      placeholder="目標のタイトル"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      説明
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`mt-1 ${styles.inputField}`}
                      placeholder="目標の詳細説明"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        開始日
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`mt-1 ${styles.inputField}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        終了日
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`mt-1 ${styles.inputField}`}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" className={styles.btnSecondary} onClick={onClose}>
                      キャンセル
                    </button>
                    <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
                      {isLoading ? '保存中...' : goal ? '更新' : '作成'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
