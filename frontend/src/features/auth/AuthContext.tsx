import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth'
import type { User } from '../../types'

const USE_MOCK_AUTH = import.meta.env.DEV && !import.meta.env.VITE_COGNITO_USER_POOL_ID

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
  confirmRegistration: (email: string, code: string) => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const MOCK_USER_KEY = 'mock_user'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    if (USE_MOCK_AUTH) {
      const savedUser = localStorage.getItem(MOCK_USER_KEY)
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      setIsLoading(false)
      return
    }

    try {
      const currentUser = await getCurrentUser()
      setUser({
        id: currentUser.userId,
        email: currentUser.signInDetails?.loginId || '',
      })
    } catch (error) {
      console.error('Authentication check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockUser: User = {
        id: `mock-user-${Date.now()}`,
        email,
        name: email.split('@')[0],
      }
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      return
    }

    const result = await signIn({ username: email, password })
    if (result.isSignedIn) {
      const currentUser = await getCurrentUser()
      setUser({
        id: currentUser.userId,
        email: currentUser.signInDetails?.loginId || email,
      })
    }
  }

  async function logout() {
    if (USE_MOCK_AUTH) {
      localStorage.removeItem(MOCK_USER_KEY)
      setUser(null)
      return
    }

    await signOut()
    setUser(null)
  }

  async function register(email: string, password: string) {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return
    }

    await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    })
  }

  async function confirmRegistration(email: string, code: string) {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return
    }

    await confirmSignUp({
      username: email,
      confirmationCode: code,
    })
  }

  async function getAccessToken(): Promise<string | null> {
    if (USE_MOCK_AUTH) {
      return 'mock-access-token'
    }

    try {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() || null
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    confirmRegistration,
    getAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
