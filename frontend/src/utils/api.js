import axios from 'axios'

const apiHost = import.meta.env.VITE_API_HOST?.replace(/^https?:\/\//, '').replace(/\/$/, '')

const api = axios.create({
  baseURL: apiHost ? `https://${apiHost}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('loxionmart-auth')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
  } catch (_) {}
  return config
})

// Handle 401s globally — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('loxionmart-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
