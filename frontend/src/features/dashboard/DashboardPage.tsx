import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { StatsCards } from './StatsCards'
import { ActivityHeatmap } from './ActivityHeatmap'
import { SkillRadarChart } from './SkillRadarChart'
import { AchievementTimeline } from './AchievementTimeline'
import {
  useDashboardStats,
  useActivityData,
  useSkillStats,
  useTimeline,
} from './useDashboard'

type Period = 'week' | 'month' | 'year'

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>('month')
  const { data: stats } = useDashboardStats()
  const { data: activityData } = useActivityData()
  const { data: skillStats } = useSkillStats()
  const { data: timeline } = useTimeline()

  const periodLabels: Record<Period, string> = {
    week: '週',
    month: '月',
    year: '年',
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">
            あなたの成長と活動を可視化します
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            {(['week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* Quick Add Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4" />
            目標を追加
          </Link>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {stats && stats.totalGoals === 0 && (
        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-white/20 p-3">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ようこそ！</h2>
              <p className="mt-1 text-indigo-100">
                最初の目標を作成して、成長の記録を始めましょう。
                目標を達成するたびに、ここに成果が表示されます。
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                <PlusIcon className="h-4 w-4" />
                最初の目標を作成
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} period={period} />}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Radar Chart */}
        {skillStats && <SkillRadarChart data={skillStats} />}

        {/* Activity Heatmap */}
        {activityData && <ActivityHeatmap data={activityData} period={period} />}
      </div>

      {/* Achievement Timeline */}
      {timeline && <AchievementTimeline items={timeline} />}
    </div>
  )
}
