import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import { errorMessage } from '../../utils/mall'
import useAuthStore from '../../store/authStore'
const Context = createContext(null)
const EMPTY = { keys: [], items: [], shops: [], unavailable_count: 0 }
export function SavedProvider({ children }) {
  const token = useAuthStore(s => s.token)
  const [data, setData] = useState(EMPTY)
  const [loadedFor, setLoadedFor] = useState(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState([])
  const activeToken = useRef(token); activeToken.current = token
  const revision = useRef(0)
  const navigate = useNavigate(), location = useLocation()
  async function reload() {
    if (!token) return
    const requestToken = token, requestRevision = ++revision.current
    try { const r = await api.get('/saved'); if (activeToken.current === requestToken && revision.current === requestRevision) { setData(r.data); setLoadedFor(requestToken); setError(false) } }
    catch { if (activeToken.current === requestToken) { setError(true); setLoadedFor(requestToken) } }
  }
  useEffect(() => { setData(EMPTY); setLoadedFor(null); setError(false); setPending([]); if (token) reload() }, [token])
  const current = loadedFor === token ? data : EMPTY
  async function toggle(kind, id) {
    if (!token) { navigate('/login', { state: { from: location.pathname + location.search } }); return }
    const key = `${kind}:${id}`
    if (pending.includes(key)) return
    const wasSaved = current.keys.includes(key), requestToken = token
    setPending(x => [...x, key])
    try {
      if (wasSaved) await api.delete(`/saved/${kind}/${id}`)
      else await api.put('/saved', { kind, target_id: id })
      if (activeToken.current === requestToken) { await reload(); toast.success(wasSaved ? 'Removed from your collection' : kind === 'shop' ? 'Shop followed' : 'Saved to your collection') }
    } catch (err) { toast.error(errorMessage(err, 'Could not update your collection.')) }
    finally { setPending(x => x.filter(v => v !== key)) }
  }
  return <Context.Provider value={{ ...current, toggle, pending, reload, error, loading: !!token && loadedFor !== token }}>{children}</Context.Provider>
}
export const useSaved = () => useContext(Context)
