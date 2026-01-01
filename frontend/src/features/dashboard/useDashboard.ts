import { useQuery } from '@tanstack/react-query'
import type { Category, DashboardStats, ActivityData, TimelineItem } from '../../types'
import { useGoals } from '../goals'
import { useMemo } from 'react'

// Mock categories for development
const mockCategories: Category[] = [
  { id: '1', userId: 'user1', name: 'AWS', color: '#FF9900', createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', userId: 'user1', name: 'Python', color: '#3776AB', createdAt: '2026-01-01T00:00:00Z' },
  { id: '3', userId: 'user1', name: 'React', color: '#61DAFB', createdAt: '2026-01-01T00:00:00Z' },
  { id: '4', userId: 'user1', name: 'Terraform', color: '#7B42BC', createdAt: '2026-01-01T00:00:00Z' },
  { id: '5', userId: 'user1', name: 'Docker', color: '#2496ED', createdAt: '2026-01-01T00:00:00Z' },
]

const USE_MOCK = true

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return mockCategories
      }
      // TODO: Real API call
      return []
    },
  })
}

export function useDashboardStats() {
  const { data: goals = [] } = useGoals()

  const stats = useMemo((): DashboardStats => {
    const completedGoals = goals.filter((g) => g.status === 'completed').length
    const inProgressGoals = goals.filter((g) => g.status === 'in_progress').length

    // Calculate streak (consecutive days with activity)
    const today = new Date()
    let streakDays = 0
    const activityDates = new Set(
      goals.map((g) => g.updatedAt.split('T')[0])
    )

    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      if (activityDates.has(dateStr)) {
        streakDays++
      } else if (i > 0) {
        break
      }
    }

    return {
      totalGoals: goals.length,
      completedGoals,
      inProgressGoals,
      totalMilestones: 0, // Will be calculated when we have all milestones
      completedMilestones: 0,
      overdueMilestones: 0,
      streakDays,
    }
  }, [goals])

  return { data: stats, isLoading: false }
}

export function useActivityData() {
  const { data: goals = [] } = useGoals()

  const activityData = useMemo((): ActivityData[] => {
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // Create a map of date -> count
    const activityMap = new Map<string, number>()

    // Count activities from goals
    goals.forEach((goal) => {
      const createdDate = goal.createdAt.split('T')[0]
      const updatedDate = goal.updatedAt.split('T')[0]

      activityMap.set(createdDate, (activityMap.get(createdDate) || 0) + 1)
      if (createdDate !== updatedDate) {
        activityMap.set(updatedDate, (activityMap.get(updatedDate) || 0) + 1)
      }
    })

    // Generate array for the past year
    const result: ActivityData[] = []
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      result.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
      })
    }

    return result
  }, [goals])

  return { data: activityData, isLoading: false }
}

export function useTimeline() {
  const { data: goals = [] } = useGoals()

  const timeline = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = []

    // Add completed goals
    goals
      .filter((g) => g.status === 'completed')
      .forEach((goal) => {
        items.push({
          id: goal.id,
          type: 'goal',
          title: goal.title,
          description: goal.description,
          completedAt: goal.updatedAt,
        })
      })

    // Sort by completion date (newest first)
    items.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

    return items
  }, [goals])

  return { data: timeline, isLoading: false }
}

export function useSkillStats() {
  const { data: goals = [] } = useGoals()
  const { data: categories = [] } = useCategories()

  const skillStats = useMemo(() => {
    // For now, distribute goals evenly across categories for demo
    // In real implementation, goals would have categoryId
    return categories.map((category, index) => {
      const goalsForCategory = goals.filter((_, i) => i % categories.length === index)
      const completed = goalsForCategory.filter((g) => g.status === 'completed').length
      const total = Math.max(goalsForCategory.length, 1)

      return {
        category: category.name,
        value: Math.round((completed / total) * 100),
        fullMark: 100,
        color: category.color,
      }
    })
  }, [goals, categories])

  return { data: skillStats, isLoading: false }
}
