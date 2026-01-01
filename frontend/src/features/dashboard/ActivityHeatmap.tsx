import { useMemo, useState } from 'react'
import type { ActivityData } from '../../types'

interface ActivityHeatmapProps {
  data: ActivityData[]
  period: 'week' | 'month' | 'year'
}

export function ActivityHeatmap({ data, period }: ActivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; data: ActivityData } | null>(null)

  const filteredData = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date(now)

    switch (period) {
      case 'week':
        cutoffDate.setDate(cutoffDate.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1)
        break
      case 'year':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)
        break
    }

    return data.filter((d) => new Date(d.date) >= cutoffDate)
  }, [data, period])

  const { weeks, months, totalActivity } = useMemo(() => {
    const weeksData: ActivityData[][] = []
    let currentWeek: ActivityData[] = []
    let total = 0

    // Pad the first week if it doesn't start on Sunday
    if (filteredData.length > 0) {
      const firstDate = new Date(filteredData[0].date)
      const dayOfWeek = firstDate.getDay()
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', count: -1 })
      }
    }

    filteredData.forEach((item) => {
      currentWeek.push(item)
      total += item.count
      if (currentWeek.length === 7) {
        weeksData.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: -1 })
      }
      weeksData.push(currentWeek)
    }

    // Get month labels
    const monthsData: { name: string; startWeek: number }[] = []
    let lastMonth = -1
    weeksData.forEach((week, weekIndex) => {
      const validDay = week.find((d) => d.date)
      if (validDay) {
        const date = new Date(validDay.date)
        const month = date.getMonth()
        if (month !== lastMonth) {
          monthsData.push({
            name: date.toLocaleDateString('ja-JP', { month: 'short' }),
            startWeek: weekIndex,
          })
          lastMonth = month
        }
      }
    })

    return { weeks: weeksData, months: monthsData, totalActivity: total }
  }, [filteredData])

  const getColor = (count: number) => {
    if (count < 0) return 'transparent'
    if (count === 0) return '#ebedf0'
    if (count === 1) return '#9be9a8'
    if (count === 2) return '#40c463'
    if (count <= 4) return '#30a14e'
    return '#216e39'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const cellSize = 14
  const cellGap = 3
  const weekHeight = (cellSize + cellGap) * 7
  const totalWidth = weeks.length * (cellSize + cellGap)

  const periodLabel = {
    week: '過去7日間',
    month: '過去1ヶ月',
    year: '過去1年間',
  }[period]

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">活動カレンダー</h3>
          <p className="text-xs text-gray-500">{periodLabel}</p>
        </div>
        <div className="rounded-lg bg-indigo-50 px-3 py-1.5">
          <span className="text-sm font-semibold text-indigo-600">{totalActivity}</span>
          <span className="ml-1 text-xs text-indigo-500">回の活動</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative overflow-x-auto">
        <svg
          width={Math.max(totalWidth + 50, 300)}
          height={weekHeight + 35}
          className="min-w-full"
        >
          {/* Month labels */}
          {months.map((month) => (
            <text
              key={`${month.name}-${month.startWeek}`}
              x={month.startWeek * (cellSize + cellGap) + 35}
              y={12}
              fontSize={11}
              fill="#6b7280"
              fontWeight="500"
            >
              {month.name}
            </text>
          ))}

          {/* Day labels */}
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <text
              key={day}
              x={12}
              y={25 + i * (cellSize + cellGap) + cellSize / 2 + 4}
              fontSize={10}
              fill="#9ca3af"
              textAnchor="middle"
            >
              {i % 2 === 1 ? day : ''}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <g key={`${weekIndex}-${dayIndex}`}>
                <rect
                  x={35 + weekIndex * (cellSize + cellGap)}
                  y={22 + dayIndex * (cellSize + cellGap)}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  fill={getColor(day.count)}
                  className={day.date ? 'cursor-pointer transition-all hover:ring-2 hover:ring-indigo-400' : ''}
                  onMouseEnter={() => {
                    if (day.date) {
                      setHoveredCell({
                        x: 35 + weekIndex * (cellSize + cellGap),
                        y: 22 + dayIndex * (cellSize + cellGap),
                        data: day,
                      })
                    }
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              </g>
            ))
          )}

          {/* Tooltip */}
          {hoveredCell && (
            <g>
              <rect
                x={Math.min(hoveredCell.x - 40, totalWidth - 80)}
                y={hoveredCell.y - 50}
                width={120}
                height={42}
                rx={6}
                fill="#1f2937"
                opacity={0.95}
              />
              <text
                x={Math.min(hoveredCell.x + 20, totalWidth)}
                y={hoveredCell.y - 32}
                fontSize={11}
                fill="white"
                textAnchor="middle"
              >
                {formatDate(hoveredCell.data.date)}
              </text>
              <text
                x={Math.min(hoveredCell.x + 20, totalWidth)}
                y={hoveredCell.y - 16}
                fontSize={12}
                fill="#a5b4fc"
                textAnchor="middle"
                fontWeight="600"
              >
                {hoveredCell.data.count}件の活動
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          {totalActivity > 0
            ? '活動を続けて目標に近づこう！'
            : '今日から活動を始めよう！'}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">少</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="h-3.5 w-3.5 rounded-sm transition-transform hover:scale-110"
              style={{ backgroundColor: getColor(level === 0 ? 0 : level) }}
              title={`活動レベル ${level}`}
            />
          ))}
          <span className="text-xs text-gray-500">多</span>
        </div>
      </div>
    </div>
  )
}
