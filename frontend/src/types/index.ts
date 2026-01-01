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
