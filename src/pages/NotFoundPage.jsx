import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-wrap">
      <h1>Page not found</h1>
      <p className="muted">The route you requested does not exist.</p>
      <div className="actions-row">
        <Link className="button-primary" to="/">
          Go to Home
        </Link>
      </div>
    </section>
  )
}

