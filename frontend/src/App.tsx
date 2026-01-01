import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, LoginPage, SignupPage, ProtectedRoute } from './features/auth'
import { GoalsPage, GoalDetailPage } from './features/goals'
import { Layout } from './components/Layout'
import { configureAmplify } from './lib/amplify'
import './index.css'

configureAmplify()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GoalsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GoalDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
