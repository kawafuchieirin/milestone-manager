import { useMemo } from 'react'
import type { Goal } from '../../types'
import { useMilestones } from './useMilestones'

interface GanttChartProps {
  goal: Goal
}

const DAY_WIDTH = 24
const ROW_HEIGHT = 40
const HEADER_HEIGHT = 60

export function GanttChart({ goal }: GanttChartProps) {
  const { data: milestones } = useMilestones(goal.id)

  const chartData = useMemo(() => {
    const startDate = new Date(goal.startDate)
    const endDate = new Date(goal.endDate)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOffset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const months: { name: string; days: number; startDay: number }[] = []
    let currentDate = new Date(startDate)
    let dayCount = 0

    while (currentDate <= endDate) {
      const monthStart = dayCount
      const monthName = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })
      let monthDays = 0

      const currentMonth = currentDate.getMonth()
      while (currentDate <= endDate && currentDate.getMonth() === currentMonth) {
        monthDays++
        dayCount++
        currentDate.setDate(currentDate.getDate() + 1)
      }

      months.push({ name: monthName, days: monthDays, startDay: monthStart })
    }

    const sortedMilestones = [...(milestones || [])].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )

    const milestonesWithPosition = sortedMilestones.map((milestone) => {
      const dueDate = new Date(milestone.dueDate)
      const dayOffset = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      return { ...milestone, dayOffset }
    })

    return {
      totalDays,
      months,
      milestones: milestonesWithPosition,
      todayOffset,
      startDate,
    }
  }, [goal, milestones])

  const chartWidth = chartData.totalDays * DAY_WIDTH
  const chartHeight = HEADER_HEIGHT + (chartData.milestones.length || 1) * ROW_HEIGHT + 20

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
  }

  const statusColors = {
    pending: { bg: '#E5E7EB', border: '#9CA3AF' },
    in_progress: { bg: '#DBEAFE', border: '#3B82F6' },
    completed: { bg: '#D1FAE5', border: '#10B981' },
  }

  if (!milestones || milestones.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">
          マイルストーンを追加するとガントチャートが表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <svg width={chartWidth + 200} height={chartHeight} className="min-w-full">
        <defs>
          <pattern id="gridPattern" width={DAY_WIDTH} height={ROW_HEIGHT} patternUnits="userSpaceOnUse">
            <path d={`M ${DAY_WIDTH} 0 L 0 0 0 ${ROW_HEIGHT}`} fill="none" stroke="#E5E7EB" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background */}
        <rect x="200" y={HEADER_HEIGHT} width={chartWidth} height={chartHeight - HEADER_HEIGHT} fill="url(#gridPattern)" />

        {/* Month headers */}
        {chartData.months.map((month, index) => (
          <g key={index}>
            <rect
              x={200 + month.startDay * DAY_WIDTH}
              y="0"
              width={month.days * DAY_WIDTH}
              height="30"
              fill="#F3F4F6"
              stroke="#E5E7EB"
            />
            <text
              x={200 + month.startDay * DAY_WIDTH + (month.days * DAY_WIDTH) / 2}
              y="20"
              textAnchor="middle"
              className="fill-gray-700 text-xs font-medium"
            >
              {month.name}
            </text>
          </g>
        ))}

        {/* Day numbers (show every 7th day) */}
        {Array.from({ length: chartData.totalDays }).map((_, index) => {
          if (index % 7 !== 0 && index !== chartData.totalDays - 1) return null
          const date = new Date(chartData.startDate)
          date.setDate(date.getDate() + index)
          return (
            <text
              key={index}
              x={200 + index * DAY_WIDTH + DAY_WIDTH / 2}
              y="48"
              textAnchor="middle"
              className="fill-gray-500 text-xs"
            >
              {date.getDate()}
            </text>
          )
        })}

        {/* Today line */}
        {chartData.todayOffset >= 0 && chartData.todayOffset <= chartData.totalDays && (
          <line
            x1={200 + chartData.todayOffset * DAY_WIDTH}
            y1={HEADER_HEIGHT}
            x2={200 + chartData.todayOffset * DAY_WIDTH}
            y2={chartHeight}
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}

        {/* Milestones */}
        {chartData.milestones.map((milestone, index) => {
          const y = HEADER_HEIGHT + index * ROW_HEIGHT + ROW_HEIGHT / 2
          const x = 200 + milestone.dayOffset * DAY_WIDTH
          const colors = statusColors[milestone.status]

          return (
            <g key={milestone.id}>
              {/* Milestone label */}
              <text
                x="10"
                y={y + 4}
                className="fill-gray-700 text-sm"
                style={{ fontSize: '12px' }}
              >
                {milestone.title.length > 20 ? milestone.title.slice(0, 20) + '...' : milestone.title}
              </text>

              {/* Horizontal line to milestone */}
              <line
                x1="200"
                y1={y}
                x2={x - 8}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />

              {/* Milestone marker (diamond shape) */}
              <g transform={`translate(${x}, ${y})`}>
                <path
                  d="M 0 -10 L 10 0 L 0 10 L -10 0 Z"
                  fill={colors.bg}
                  stroke={colors.border}
                  strokeWidth="2"
                />
                {milestone.status === 'completed' && (
                  <path
                    d="M -4 0 L -1 3 L 4 -3"
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>

              {/* Date label */}
              <text
                x={x}
                y={y + 22}
                textAnchor="middle"
                className="fill-gray-500"
                style={{ fontSize: '10px' }}
              >
                {formatDate(milestone.dueDate)}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(10, ${chartHeight - 25})`}>
          <rect x="0" y="0" width="10" height="10" fill="#EF4444" />
          <text x="15" y="9" className="fill-gray-600" style={{ fontSize: '10px' }}>今日</text>

          <circle cx="60" cy="5" r="5" fill="#E5E7EB" stroke="#9CA3AF" />
          <text x="70" y="9" className="fill-gray-600" style={{ fontSize: '10px' }}>未着手</text>

          <circle cx="120" cy="5" r="5" fill="#DBEAFE" stroke="#3B82F6" />
          <text x="130" y="9" className="fill-gray-600" style={{ fontSize: '10px' }}>進行中</text>

          <circle cx="180" cy="5" r="5" fill="#D1FAE5" stroke="#10B981" />
          <text x="190" y="9" className="fill-gray-600" style={{ fontSize: '10px' }}>完了</text>
        </g>
      </svg>
    </div>
  )
}
