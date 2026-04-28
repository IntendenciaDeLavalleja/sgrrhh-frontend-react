import axios from 'axios'

const api = axios.create({ baseURL: '/api/auth' })

export interface LoginCredentials {
  email: string
  password: string
  captcha_answer: number
}

export interface LoginResponse {
  success: boolean
  message: string
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
  getCaptcha: async (): Promise<{ question: string }> => {
    const { data } = await api.get<{ question: string }>('/captcha')
    return data
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/login', credentials)
    return data
  },

  verify2FA: async (code: string): Promise<Verify2FAResponse> => {
    const { data } = await api.post<Verify2FAResponse>('/verify-2fa', { code })
    return data
  },
}
