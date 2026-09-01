export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="page-loader">
      <div className="spinner spinner-lg" />
      <span>{message}</span>
    </div>
  )
}
