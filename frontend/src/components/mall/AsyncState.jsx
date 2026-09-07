import { SearchX } from 'lucide-react'
export default function AsyncState({ loading, error, empty, retry, children }) {
  if (loading) return <div className="mall-loading" role="status"><span className="spinner"/>Finding your local favourites…</div>
  if (error) return <div className="mall-empty" role="alert"><h2>We couldn’t load this just yet.</h2><p>Please try again in a moment.</p><button className="btn btn-primary" onClick={retry}>Try again</button></div>
  if (empty) return <div className="mall-empty"><SearchX size={34}/><h2>Nothing here just yet.</h2><p>Try another category or clear your filters to explore more of the mall.</p></div>
  return children
}
