import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import type { Goal, Milestone } from '../../types'

interface ProgressChartProps {
  goal: Goal
  milestones: Milestone[]
}

const STATUS_COLORS = {
  pending: '#9CA3AF',
  in_progress: '#3B82F6',
  completed: '#10B981',
}

const STATUS_LABELS = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
}

export function ProgressChart({ goal, milestones }: ProgressChartProps) {
  const stats = useMemo(() => {
    const total = milestones.length
    const completed = milestones.filter((m) => m.status === 'completed').length
    const inProgress = milestones.filter((m) => m.status === 'in_progress').length
    const pending = milestones.filter((m) => m.status === 'pending').length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(goal.endDate)
    const startDate = new Date(goal.startDate)
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const timeProgress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0

    const overdue = milestones.filter((m) => {
      if (m.status === 'completed') return false
      return new Date(m.dueDate) < today
    }).length

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      daysRemaining,
      timeProgress,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    }
  }, [goal, milestones])

  const pieData = useMemo(() => {
    return [
      { name: STATUS_LABELS.completed, value: stats.completed, color: STATUS_COLORS.completed },
      { name: STATUS_LABELS.in_progress, value: stats.inProgress, color: STATUS_COLORS.in_progress },
      { name: STATUS_LABELS.pending, value: stats.pending, color: STATUS_COLORS.pending },
    ].filter((d) => d.value > 0)
  }, [stats])

  const timelineData = useMemo(() => {
    const monthlyData: Record<string, { month: string; completed: number; total: number }> = {}

    milestones.forEach((m) => {
      const date = new Date(m.dueDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, completed: 0, total: 0 }
      }
      monthlyData[monthKey].total++
      if (m.status === 'completed') {
        monthlyData[monthKey].completed++
      }
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => data)
  }, [milestones])

  if (milestones.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">
          マイルストーンを追加すると進捗グラフが表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">完了率</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {Math.round(stats.completionRate)}%
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">マイルストーン</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {stats.completed}/{stats.total}
          </p>
          <p className="mt-1 text-xs text-gray-500">完了</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">残り日数</p>
          <p className={`mt-1 text-2xl font-bold ${stats.daysRemaining < 0 ? 'text-red-600' : stats.daysRemaining <= 7 ? 'text-yellow-600' : 'text-gray-900'}`}>
            {stats.daysRemaining < 0 ? `${Math.abs(stats.daysRemaining)}日超過` : `${stats.daysRemaining}日`}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${stats.timeProgress}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">期限超過</p>
          <p className={`mt-1 text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.overdue}件
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {stats.overdue > 0 ? '対応が必要です' : '問題なし'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-sm font-medium text-gray-700">ステータス別分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}件`, 'マイルストーン']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Monthly Progress */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-sm font-medium text-gray-700">月別マイルストーン</h3>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}件`,
                    name === 'completed' ? '完了' : '合計',
                  ]}
                />
                <Bar dataKey="total" name="合計" fill="#E5E7EB" />
                <Bar dataKey="completed" name="完了" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-gray-500">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* Progress vs Time comparison */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-sm font-medium text-gray-700">進捗 vs 経過時間</h3>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">タスク完了率</span>
              <span className="font-medium text-green-600">{Math.round(stats.completionRate)}%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">期間経過率</span>
              <span className="font-medium text-indigo-600">{Math.round(stats.timeProgress)}%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${stats.timeProgress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {stats.completionRate >= stats.timeProgress
              ? '順調に進んでいます'
              : '進捗が遅れています。ペースアップが必要かもしれません'}
          </p>
        </div>
      </div>
    </div>
  )
}
