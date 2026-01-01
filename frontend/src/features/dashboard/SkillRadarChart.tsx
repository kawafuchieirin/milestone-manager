import { useState } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface SkillData {
  category: string
  value: number
  fullMark: number
  color: string
}

interface SkillRadarChartProps {
  data: SkillData[]
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const averageScore = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)
    : 0

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">スキル成長</h3>
            <p className="text-xs text-gray-500">カテゴリ別の達成度</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-indigo-50 p-4">
            <SparklesIcon className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            カテゴリを追加してスキルを可視化
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            目標にカテゴリを設定すると、<br />
            スキルの成長が見えるようになります
          </p>
          <button
            className="mt-4 inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
          >
            <PlusIcon className="h-4 w-4" />
            カテゴリを追加
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">スキル成長</h3>
          <p className="text-xs text-gray-500">カテゴリ別の達成度</p>
        </div>
        <div className="rounded-lg bg-indigo-50 px-3 py-1.5">
          <span className="text-sm font-semibold text-indigo-600">{averageScore}</span>
          <span className="ml-1 text-xs text-indigo-500">%平均</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="category"
              tick={({ x, y, payload }) => {
                const isActive = activeCategory === payload.value
                const item = data.find((d) => d.category === payload.value)
                return (
                  <g
                    transform={`translate(${x},${y})`}
                    onMouseEnter={() => setActiveCategory(payload.value)}
                    onMouseLeave={() => setActiveCategory(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <text
                      x={0}
                      y={0}
                      dy={4}
                      textAnchor="middle"
                      fill={isActive ? item?.color || '#6366f1' : '#6b7280'}
                      fontSize={isActive ? 13 : 12}
                      fontWeight={isActive ? 600 : 400}
                      className="transition-all"
                    >
                      {payload.value}
                    </text>
                  </g>
                )
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickCount={5}
              axisLine={false}
            />
            <Radar
              name="達成度"
              dataKey="value"
              stroke="#6366f1"
              fill="url(#radarGradient)"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <Tooltip
              formatter={(value) => [`${value}%`, '達成度']}
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: '4px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Category legend */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex flex-wrap justify-center gap-2">
          {data.map((item) => {
            const isActive = activeCategory === item.category

            return (
              <button
                key={item.category}
                onMouseEnter={() => setActiveCategory(item.category)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all ${
                  isActive
                    ? 'bg-gray-100 ring-2 ring-offset-1'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  ['--tw-ring-color' as string]: item.color,
                }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-700">{item.category}</span>
                <span className="text-gray-500">{item.value}%</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
