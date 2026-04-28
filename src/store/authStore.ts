import { create } from 'zustand'

const TOKEN_KEY = 'auth_token'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

interface AuthUser {
  username: string
  email: string
  is_superuser: boolean
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setAuth: (token: string, expiresIn: number, user: AuthUser) => void
  logout: () => void
  checkAuth: () => boolean
}

function decodeJWTUser(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.username && payload.email) {
      return {
        username: payload.username,
        email: payload.email,
        is_superuser: payload.is_superuser ?? false,
      }
    }
    return null
  } catch {
    return null
  }
}

function isTokenValid(): boolean {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!token || !expiry) return false
  return Date.now() < parseInt(expiry, 10)
}

const storedToken = localStorage.getItem(TOKEN_KEY)
const valid = isTokenValid()

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: valid && storedToken ? decodeJWTUser(storedToken) : null,
  isAuthenticated: valid,

  setAuth: (token, expiresIn, user) => {
    const expiry = Date.now() + expiresIn * 1000
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    set({ token: null, user: null, isAuthenticated: false })
  },

  checkAuth: () => {
    if (!isTokenValid()) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
      set({ token: null, user: null, isAuthenticated: false })
      return false
    }
    return true
  },
}))
