import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { isSupabaseConfigured } from '../lib/supabase.js'

function navLinkClass({ isActive }) {
  return isActive ? 'nav-link nav-link-active' : 'nav-link'
}

export function Layout() {
  const { user, isAdmin, signOut } = useAuth()

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">VT</span>
            <span>
              Vaishnavi Technologies
              <small className="brand-subtitle">Project Development Studio</small>
            </span>
          </Link>
          <nav className="nav-links">
            <NavLink to="/catalog" className={navLinkClass}>
              Catalog
            </NavLink>
            <NavLink to="/inquire" className={navLinkClass}>
              Inquire
            </NavLink>
            {user ? (
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            ) : null}
            {isAdmin ? (
              <NavLink to="/admin/projects" className={navLinkClass}>
                Admin
              </NavLink>
            ) : null}
            {!user ? (
              <NavLink to="/auth" className="nav-button nav-button-primary">
                Login
              </NavLink>
            ) : (
              <button type="button" className="nav-button" onClick={signOut}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="page-wrap">
        {!isSupabaseConfigured ? (
          <div className="error-box">
            Missing Supabase environment variables. Set
            {' '}
            <code>VITE_SUPABASE_URL</code>
            {' '}
            and
            {' '}
            <code>VITE_SUPABASE_ANON_KEY</code>
            .
          </div>
        ) : null}
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          Vaishnavi Technologies · B.Tech &amp; M.Tech CSE Project Development
          Studio
        </div>
      </footer>
    </div>
  )
}
