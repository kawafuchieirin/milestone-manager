import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import type { Milestone, CreateMilestoneInput, UpdateMilestoneInput } from '../../types'

export function useMilestones(goalId: string) {
  return useQuery({
    queryKey: ['milestones', goalId],
    queryFn: async (): Promise<Milestone[]> => {
      return apiClient.getMilestones(goalId)
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
      return apiClient.createMilestone(goalId, data)
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
      data,
    }: {
      id: string
      goalId: string
      data: UpdateMilestoneInput
    }): Promise<Milestone> => {
      return apiClient.updateMilestone(id, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.goalId] })
    },
  })
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; goalId: string }): Promise<void> => {
      return apiClient.deleteMilestone(id)
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
      status,
    }: {
      id: string
      goalId: string
      status: Milestone['status']
    }): Promise<Milestone> => {
      return apiClient.updateMilestone(id, { status })
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
      orderedIds,
    }: {
      goalId: string
      orderedIds: string[]
    }): Promise<Milestone[]> => {
      // Update each milestone's order
      const updates = orderedIds.map((id, index) =>
        apiClient.updateMilestone(id, { order: index + 1 })
      )
      return Promise.all(updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.goalId] })
    },
  })
}
