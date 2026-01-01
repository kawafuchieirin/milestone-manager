import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockGoals, mockMilestones } from '../../lib/mockData'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../../types'

const USE_MOCK = true

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async (): Promise<Goal[]> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return mockGoals
      }
      throw new Error('API not implemented')
    },
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: async (): Promise<Goal> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const goal = mockGoals.find((g) => g.id === id)
        if (!goal) throw new Error('Goal not found')
        return goal
      }
      throw new Error('API not implemented')
    },
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateGoalInput): Promise<Goal> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const newGoal: Goal = {
          id: `goal-${Date.now()}`,
          userId: 'user-1',
          ...data,
          status: 'not_started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        mockGoals.push(newGoal)
        mockMilestones[newGoal.id] = []
        return newGoal
      }
      throw new Error('API not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGoalInput }): Promise<Goal> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = mockGoals.findIndex((g) => g.id === id)
        if (index === -1) throw new Error('Goal not found')
        mockGoals[index] = {
          ...mockGoals[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        return mockGoals[index]
      }
      throw new Error('API not implemented')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = mockGoals.findIndex((g) => g.id === id)
        if (index !== -1) {
          mockGoals.splice(index, 1)
          delete mockMilestones[id]
        }
        return
      }
      throw new Error('API not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
