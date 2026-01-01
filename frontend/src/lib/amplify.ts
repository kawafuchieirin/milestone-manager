import { Amplify } from 'aws-amplify'

const USE_MOCK_AUTH = import.meta.env.DEV && !import.meta.env.VITE_COGNITO_USER_POOL_ID

export function configureAmplify() {
  if (USE_MOCK_AUTH) {
    console.info('Mock authentication mode: Skipping Amplify configuration')
    return
  }

  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string
  const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string

  if (!userPoolId || !userPoolClientId) {
    throw new Error('Cognito configuration is incomplete. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID')
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: 'code' as const,
      },
    },
  })
}
