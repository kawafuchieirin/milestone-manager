import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { styles } from '../../lib/styles'

const USE_MOCK_AUTH = import.meta.env.DEV && !import.meta.env.VITE_COGNITO_USER_POOL_ID

type Step = 'register' | 'confirm'

export function SignupPage() {
  const [step, setStep] = useState<Step>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, confirmRegistration, login } = useAuth()
  const navigate = useNavigate()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります')
      return
    }

    setIsLoading(true)

    try {
      await register(email, password)

      if (USE_MOCK_AUTH) {
        await login(email, password)
        navigate('/')
      } else {
        setStep('confirm')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await confirmRegistration(email, code)
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '確認コードが正しくありません')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              メール確認
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {email} に送信された確認コードを入力してください
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleConfirm}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                確認コード
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`mt-1 ${styles.inputField}`}
                placeholder="123456"
              />
            </div>

            <button type="submit" disabled={isLoading} className={`w-full ${styles.btnPrimary}`}>
              {isLoading ? '確認中...' : '確認'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            新規アカウント登録
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              ログイン
            </Link>
          </p>
          {USE_MOCK_AUTH && (
            <p className="mt-2 text-center text-xs text-amber-600">
              開発モード: メール確認なしで登録できます
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 ${styles.inputField}`}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 ${styles.inputField}`}
                placeholder="8文字以上"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`mt-1 ${styles.inputField}`}
                placeholder="パスワードを再入力"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={`w-full ${styles.btnPrimary}`}>
            {isLoading ? '登録中...' : '登録'}
          </button>
        </form>
      </div>
    </div>
  )
}
