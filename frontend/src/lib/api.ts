import type {
  Goal,
  Milestone,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiClient {
  private getAccessToken: (() => Promise<string | null>) | null = null

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getAccessToken = getter
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken ? await this.getAccessToken() : null

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>('/goals')
  }

  async getGoal(id: string): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`)
  }

  async createGoal(data: CreateGoalInput): Promise<Goal> {
    return this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateGoal(id: string, data: UpdateGoalInput): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteGoal(id: string): Promise<void> {
    await this.request(`/goals/${id}`, {
      method: 'DELETE',
    })
  }

  async getMilestones(goalId: string): Promise<Milestone[]> {
    return this.request<Milestone[]>(`/goals/${goalId}/milestones`)
  }

  async createMilestone(goalId: string, data: CreateMilestoneInput): Promise<Milestone> {
    return this.request<Milestone>(`/goals/${goalId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMilestone(id: string, data: UpdateMilestoneInput): Promise<Milestone> {
    return this.request<Milestone>(`/milestones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMilestone(id: string): Promise<void> {
    await this.request(`/milestones/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()
