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
            <NavLink to="/contact" className={navLinkClass}>
              Contact
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
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="brand">
                <span className="brand-mark">VT</span>
                <span>Vaishnavi Technologies</span>
              </Link>
              <p className="muted">
                B.Tech &amp; M.Tech CSE project mentorship — development,
                documentation, and viva support.
              </p>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/catalog">Project Catalog</Link>
                </li>
                <li>
                  <Link to="/inquire">Inquire Now</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
                {user ? (
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/auth">Login</Link>
                  </li>
                )}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="footer-links">
                <li>
                  <a href="mailto:hello@vaishnavitech.in">
                    hello@vaishnavitech.in
                  </a>
                </li>
                <li>
                  <a href="tel:+910000000000">+91 00000 00000</a>
                </li>
                <li className="footer-address">
                  Your Street, Area,
                  <br />
                  City, Andhra Pradesh, 000000
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Vaishnavi Technologies. All
              rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}