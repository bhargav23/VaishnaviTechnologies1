import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { trackContactClick } from '../lib/analytics.js'
import { CONTACT, whatsappUrl } from '../lib/constants.js'
import { isSupabaseConfigured } from '../lib/supabase.js'

const CURRENT_YEAR = new Date().getFullYear()

function navLinkClass({ isActive }) {
  return isActive ? 'nav-link nav-link-active' : 'nav-link'
}

export function Layout() {
  const { user, isAdmin, profileError, refreshProfile, signOut } = useAuth()

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
        {profileError ? (
          <div className="error-box" role="alert">
            Could not load your account profile: {profileError}
            {' '}
            <button
              type="button"
              className="button-secondary"
              onClick={() => refreshProfile(user)}
            >
              Retry
            </button>
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
                B.Tech, M.Tech &amp; PhD CSE project and research mentorship —
                development, documentation, and viva preparation.
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
                  <a
                    href={`mailto:${CONTACT.email}`}
                    onClick={() => trackContactClick('email')}
                  >
                    {CONTACT.email}
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.phoneHref}
                    onClick={() => trackContactClick('phone')}
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappUrl()}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackContactClick('whatsapp')}
                  >
                    WhatsApp us
                  </a>
                </li>
                <li className="footer-address">
                  Cheediga,
                  <br />
                  Kakinada, Andhra Pradesh - 533006
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {CURRENT_YEAR} Vaishnavi Technologies. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      <a
        className="whatsapp-fab"
        href={whatsappUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        onClick={() => trackContactClick('whatsapp')}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5Z" />
        </svg>
        <span>WhatsApp</span>
      </a>
    </div>
  )
}