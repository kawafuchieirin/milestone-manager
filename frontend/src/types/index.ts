export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed'

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: GoalStatus
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  goalId: string
  title: string
  description?: string
  dueDate: string
  status: MilestoneStatus
  order: number
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name?: string
}

export interface CreateGoalInput {
  title: string
  description: string
  startDate: string
  endDate: string
}

export interface UpdateGoalInput {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: GoalStatus
}

export interface CreateMilestoneInput {
  title: string
  description?: string
  dueDate: string
}

export interface UpdateMilestoneInput {
  title?: string
  description?: string
  dueDate?: string
  status?: MilestoneStatus
  order?: number
}

// Category
export interface Category {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
}

export interface CreateCategoryInput {
  name: string
  color: string
}

export interface UpdateCategoryInput {
  name?: string
  color?: string
}

// Dashboard
export interface DashboardStats {
  totalGoals: number
  completedGoals: number
  inProgressGoals: number
  totalMilestones: number
  completedMilestones: number
  overdueMilestones: number
  streakDays: number
}

export interface ActivityData {
  date: string
  count: number
}

export interface TimelineItem {
  id: string
  type: 'goal' | 'milestone'
  title: string
  description?: string
  completedAt: string
  categoryId?: string
}
