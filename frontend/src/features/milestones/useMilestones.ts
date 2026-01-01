import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockMilestones } from '../../lib/mockData'
import type { Milestone, CreateMilestoneInput, UpdateMilestoneInput } from '../../types'

const USE_MOCK = true

export function useMilestones(goalId: string) {
  return useQuery({
    queryKey: ['milestones', goalId],
    queryFn: async (): Promise<Milestone[]> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return mockMilestones[goalId] || []
      }
      throw new Error('API not implemented')
    },
    enabled: !!goalId,
  })
}

export function useCreateMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      data,
    }: {
      goalId: string
      data: CreateMilestoneInput
    }): Promise<Milestone> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const existingMilestones = mockMilestones[goalId] || []
        const newMilestone: Milestone = {
          id: `milestone-${Date.now()}`,
          goalId,
          ...data,
          status: 'pending',
          order: existingMilestones.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        if (!mockMilestones[goalId]) {
          mockMilestones[goalId] = []
        }
        mockMilestones[goalId].push(newMilestone)
        return newMilestone
      }
      throw new Error('API not implemented')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.goalId] })
    },
  })
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      goalId,
      data,
    }: {
      id: string
      goalId: string
      data: UpdateMilestoneInput
    }): Promise<Milestone> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const milestones = mockMilestones[goalId]
        if (!milestones) throw new Error('Goal not found')
        const index = milestones.findIndex((m) => m.id === id)
        if (index === -1) throw new Error('Milestone not found')
        milestones[index] = {
          ...milestones[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        return milestones[index]
      }
      throw new Error('API not implemented')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.goalId] })
    },
  })
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, goalId }: { id: string; goalId: string }): Promise<void> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const milestones = mockMilestones[goalId]
        if (!milestones) return
        const index = milestones.findIndex((m) => m.id === id)
        if (index !== -1) {
          milestones.splice(index, 1)
        }
        return
      }
      throw new Error('API not implemented')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.goalId] })
    },
  })
}

export function useUpdateMilestoneStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      goalId,
      status,
    }: {
      id: string
      goalId: string
      status: Milestone['status']
    }): Promise<Milestone> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const milestones = mockMilestones[goalId]
        if (!milestones) throw new Error('Goal not found')
        const index = milestones.findIndex((m) => m.id === id)
        if (index === -1) throw new Error('Milestone not found')
        milestones[index] = {
          ...milestones[index],
          status,
          updatedAt: new Date().toISOString(),
        }
        return milestones[index]
      }
      throw new Error('API not implemented')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.goalId] })
    },
  })
}

export function useReorderMilestones() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      orderedIds,
    }: {
      goalId: string
      orderedIds: string[]
    }): Promise<Milestone[]> => {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        const milestones = mockMilestones[goalId]
        if (!milestones) throw new Error('Goal not found')

        orderedIds.forEach((id, index) => {
          const milestone = milestones.find((m) => m.id === id)
          if (milestone) {
            milestone.order = index + 1
            milestone.updatedAt = new Date().toISOString()
          }
        })

        return milestones
      }
      throw new Error('API not implemented')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.goalId] })
    },
  })
}
