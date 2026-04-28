import axios from 'axios'

const api = axios.create({
  baseURL: '/api/auth',
  timeout: 15000,
})

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  requires_2fa: boolean
  pending_token: string
  email_preview: string
}

export interface Verify2FAResponse {
  success: boolean
  message: string
  access_token: string
  expires_in: number
  user: {
    username: string
    email: string
    is_superuser: boolean
  }
}

export const authService = {
  getCaptcha: async (): Promise<{ question: string; token: string }> => {
    const { data } = await api.get<{ question: string; token: string }>('/captcha')
    return data
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/login', credentials)
    return data
  },

  verify2FA: async (code: string, pendingToken: string): Promise<Verify2FAResponse> => {
    const { data } = await api.post<Verify2FAResponse>('/verify-2fa', { code }, {
      headers: { Authorization: `Bearer ${pendingToken}` },
    })
    return data
  },
}
