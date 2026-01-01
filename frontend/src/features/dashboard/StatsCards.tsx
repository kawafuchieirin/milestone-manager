import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  FlagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'
import type { DashboardStats } from '../../types'
import type { ComponentType, SVGProps } from 'react'

interface StatsCardsProps {
  stats: DashboardStats
  period: 'week' | 'month' | 'year'
}

interface CardData {
  title: string
  value: number
  total: number
  icon: ComponentType<SVGProps<SVGSVGElement>>
  color: string
  bgColor: string
  ringColor: string
  progressColor: string
  trend: number
  link?: string
  suffix?: string
  description: string
}

function CardContent({ card }: { card: CardData }) {
  const progress = card.total > 0 ? (card.value / card.total) * 100 : 0
  const Icon = card.icon

  return (
    <>
      {/* Background decoration */}
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${card.bgColor} opacity-50 transition-transform group-hover:scale-110`}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={`rounded-lg ${card.bgColor} p-2`}>
            <Icon className={`h-5 w-5 ${card.color}`} />
          </div>
          {card.trend !== undefined && card.trend !== 0 && (
            <div
              className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                card.trend > 0
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {card.trend > 0 ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
              {Math.abs(card.trend)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mt-4">
          <p className="text-3xl font-bold text-gray-900">
            {card.value}
            {card.suffix && (
              <span className="text-lg font-medium text-gray-500">
                {card.suffix}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-gray-500">{card.title}</p>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${card.progressColor} transition-all duration-500`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">{card.description}</p>
        </div>
      </div>
    </>
  )
}

export function StatsCards({ stats, period }: StatsCardsProps) {
  const completionRate = stats.totalGoals > 0
    ? Math.round((stats.completedGoals / stats.totalGoals) * 100)
    : 0

  const periodLabel = {
    week: '今週',
    month: '今月',
    year: '今年',
  }[period]

  const cards: CardData[] = [
    {
      title: '完了した目標',
      value: stats.completedGoals,
      total: stats.totalGoals,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      ringColor: 'ring-green-200',
      progressColor: 'bg-green-500',
      trend: 12,
      link: '/?filter=completed',
      description: `${periodLabel}に達成`,
    },
    {
      title: '進行中',
      value: stats.inProgressGoals,
      total: stats.totalGoals,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      ringColor: 'ring-blue-200',
      progressColor: 'bg-blue-500',
      trend: -5,
      link: '/?filter=in_progress',
      description: '取り組み中の目標',
    },
    {
      title: '達成率',
      value: completionRate,
      total: 100,
      icon: FlagIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      ringColor: 'ring-indigo-200',
      progressColor: 'bg-indigo-500',
      trend: 8,
      suffix: '%',
      description: '全体の進捗状況',
    },
    {
      title: '連続活動',
      value: stats.streakDays,
      total: 30,
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      ringColor: 'ring-orange-200',
      progressColor: 'bg-orange-500',
      trend: stats.streakDays > 0 ? stats.streakDays : 0,
      suffix: '日',
      description: stats.streakDays > 0 ? '継続中！' : '今日から始めよう',
    },
  ]

  const baseClassName = 'group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md'

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        if (card.link) {
          return (
            <Link
              key={card.title}
              to={card.link}
              className={`${baseClassName} cursor-pointer hover:ring-2 hover:${card.ringColor}`}
            >
              <CardContent card={card} />
            </Link>
          )
        }

        return (
          <div key={card.title} className={baseClassName}>
            <CardContent card={card} />
          </div>
        )
      })}
    </div>
  )
}
