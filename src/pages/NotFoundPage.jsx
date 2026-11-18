import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export function NotFoundPage() {
  useDocumentMeta({ title: 'Page Not Found', path: '/404', noindex: true })

  return (
    <section className="page-header">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="page-lead">
        The page you were looking for doesn&apos;t exist or has moved.
      </p>
      <div className="actions-row">
        <Link className="button-primary" to="/">
          Go to Home
        </Link>
        <Link className="button-secondary" to="/catalog">
          Browse Project Catalog
        </Link>
      </div>
    </section>
  )
}
