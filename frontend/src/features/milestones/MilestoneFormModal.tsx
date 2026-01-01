import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { styles } from '../../lib/styles'
import type { Milestone, CreateMilestoneInput } from '../../types'

interface MilestoneFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateMilestoneInput) => void
  milestone?: Milestone | null
  isLoading?: boolean
  goalEndDate?: string
}

export function MilestoneFormModal({
  isOpen,
  onClose,
  onSubmit,
  milestone,
  isLoading,
  goalEndDate,
}: MilestoneFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title)
      setDescription(milestone.description || '')
      setDueDate(milestone.dueDate)
    } else {
      setTitle('')
      setDescription('')
      setDueDate('')
    }
    setError('')
  }, [milestone, isOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    if (goalEndDate && new Date(dueDate) > new Date(goalEndDate)) {
      setError('期限は目標の終了日より前に設定してください')
      return
    }

    onSubmit({ title: title.trim(), description: description.trim() || undefined, dueDate })
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
                    {milestone ? 'マイルストーンを編集' : '新しいマイルストーンを作成'}
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
                      placeholder="マイルストーンのタイトル"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      説明（任意）
                    </label>
                    <textarea
                      id="description"
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`mt-1 ${styles.inputField}`}
                      placeholder="マイルストーンの詳細説明"
                    />
                  </div>

                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      期限
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      required
                      value={dueDate}
                      max={goalEndDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={`mt-1 ${styles.inputField}`}
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" className={styles.btnSecondary} onClick={onClose}>
                      キャンセル
                    </button>
                    <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
                      {isLoading ? '保存中...' : milestone ? '更新' : '作成'}
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
