import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setAuth: (user, token) => set({ user, token, error: null }),
      clearAuth: () => set({ user: null, token: null }),

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/register', data)
          const { user, access_token } = res.data
          set({ user, token: access_token, isLoading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.detail || 'Registration failed. Please try again.'
          set({ error: msg, isLoading: false })
          return { success: false, error: msg }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/login', { email, password })
          const { user, access_token } = res.data
          set({ user, token: access_token, isLoading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.detail || 'Invalid email or password.'
          set({ error: msg, isLoading: false })
          return { success: false, error: msg }
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
      },

      isAdmin: () => get().user?.role === 'admin',
      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'loxionmart-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
