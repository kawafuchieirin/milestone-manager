import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  FlagIcon,
  ChevronRightIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { TimelineItem } from '../../types'

interface AchievementTimelineProps {
  items: TimelineItem[]
}

export function AchievementTimeline({ items }: AchievementTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`
    return `${Math.floor(diffDays / 365)}年前`
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">達成履歴</h3>
            <p className="text-xs text-gray-500">完了した目標とマイルストーン</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-gray-100 p-4">
            <TrophyIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            まだ達成した目標がありません
          </p>
          <p className="mt-1 text-xs text-gray-500">
            目標を完了すると、ここに表示されます
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            目標を見る
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">達成履歴</h3>
          <p className="text-xs text-gray-500">
            {items.length}件の達成 - おめでとうございます！
          </p>
        </div>
        <Link
          to="/?filter=completed"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
        >
          すべて見る
          <ChevronRightIcon className="h-3 w-3" />
        </Link>
      </div>

      {/* Timeline */}
      <div className="mt-6 max-h-96 overflow-y-auto pr-2">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 h-[calc(100%-16px)] w-0.5 bg-gradient-to-b from-indigo-200 via-green-200 to-gray-200" />

          {/* Timeline items */}
          <div className="space-y-1">
            {items.map((item) => {
              const isExpanded = expandedId === item.id

              return (
                <div
                  key={item.id}
                  className="group relative"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full text-left"
                  >
                    <div
                      className={`relative flex items-start gap-4 rounded-lg py-3 pl-12 pr-4 transition-all ${
                        isExpanded
                          ? 'bg-gray-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white transition-transform group-hover:scale-110 ${
                          item.type === 'goal'
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                        }`}
                      >
                        {item.type === 'goal' ? (
                          <FlagIcon className="h-4 w-4" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                              item.type === 'goal'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.type === 'goal' ? '目標' : 'マイルストーン'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(item.completedAt)}
                          </span>
                        </div>
                        <h4 className="mt-1 truncate font-medium text-gray-900 group-hover:text-indigo-600">
                          {item.title}
                        </h4>
                      </div>

                      {/* Expand indicator */}
                      <ChevronRightIcon
                        className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="ml-12 rounded-lg bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        {formatDate(item.completedAt)} に達成
                      </p>
                      {item.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {item.description}
                        </p>
                      )}
                      {item.type === 'goal' && (
                        <Link
                          to={`/goals/${item.id}`}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          詳細を見る
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      {items.length > 5 && (
        <div className="mt-4 border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-500">
            スクロールしてさらに表示
          </p>
        </div>
      )}
    </div>
  )
}
