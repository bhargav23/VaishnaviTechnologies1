import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { trackContactClick } from '../lib/analytics.js'
import { BUSINESS, CONTACT, whatsappUrl } from '../lib/constants.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from './Icons.jsx'

const CURRENT_YEAR = new Date().getFullYear()

function navLinkClass({ isActive }) {
  return isActive ? 'nav-link nav-link-active' : 'nav-link'
}

// Scroll to the section named in the URL hash (for /#how, /#pricing, /#faq),
// including when the hash changes on the page you are already on.
function useScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      return
    }
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [pathname, hash])
}

export function Layout() {
  const { user, isAdmin, profileError, refreshProfile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  useScrollToHash()

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav-inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <img className="brand-mark" src="/logo-mark.svg" alt="" width="52" height="40" />
            <span className="brand-text">
              Vaishnavi Technologies
              <small className="brand-subtitle">Project &amp; research mentorship</small>
            </span>
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>

          <nav
            id="main-navigation"
            aria-label="Main navigation"
            className={`nav-links${menuOpen ? ' is-open' : ''}`}
          >
            <NavLink to="/catalog" className={navLinkClass} onClick={closeMenu}>
              Catalog
            </NavLink>
            <Link to="/#how" className="nav-link" onClick={closeMenu}>
              How it works
            </Link>
            <Link to="/#pricing" className="nav-link" onClick={closeMenu}>
              Pricing
            </Link>
            <Link to="/#faq" className="nav-link" onClick={closeMenu}>
              FAQ
            </Link>
            <NavLink to="/contact" className={navLinkClass} onClick={closeMenu}>
              Contact
            </NavLink>
            {user ? (
              <NavLink to="/dashboard" className={navLinkClass} onClick={closeMenu}>
                Dashboard
              </NavLink>
            ) : null}
            {isAdmin ? (
              <>
                <NavLink to="/admin/inquiries" className={navLinkClass} onClick={closeMenu}>
                  Inquiries
                </NavLink>
                <NavLink to="/admin/projects" className={navLinkClass} onClick={closeMenu}>
                  Projects
                </NavLink>
              </>
            ) : null}
            {!user ? (
              <NavLink to="/auth" className="nav-button" onClick={closeMenu}>
                Sign in
              </NavLink>
            ) : (
              <button
                type="button"
                className="nav-button"
                onClick={() => {
                  closeMenu()
                  signOut()
                }}
              >
                Sign out
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
              <img
                className="footer-logo"
                src="/logo.svg"
                alt="Vaishnavi Technologies"
                width="187"
                height="50"
                loading="lazy"
              />
              <p className="muted">
                B.Tech, M.Tech and PhD project and research mentorship —
                development, documentation, and viva preparation.
              </p>
            </div>

            <div className="footer-col">
              <h2>Explore</h2>
              <ul className="footer-links">
                <li>
                  <Link to="/catalog">Project catalog</Link>
                </li>
                <li>
                  <Link to="/#how">How it works</Link>
                </li>
                <li>
                  <Link to="/#pricing">Pricing</Link>
                </li>
                <li>
                  <Link to="/#faq">FAQ</Link>
                </li>
                {user ? (
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/auth">Sign in</Link>
                  </li>
                )}
              </ul>
            </div>

            <div className="footer-col">
              <h2>Contact</h2>
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
                  <a href={CONTACT.phoneHref} onClick={() => trackContactClick('phone')}>
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
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h2>Visit</h2>
              <ul className="footer-links">
                <li className="footer-address">
                  {BUSINESS.addressLine1}
                  <br />
                  {BUSINESS.addressLine2}
                </li>
                <li className="muted">{BUSINESS.hoursShort}</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            © {CURRENT_YEAR} Vaishnavi Technologies. All rights reserved.
          </div>
          <a
            className="whatsapp-fab"
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with us on WhatsApp"
            onClick={() => trackContactClick('whatsapp')}
          >
            <WhatsAppIcon size={20} />
            <span>WhatsApp</span>
          </a>
        </div>
      </footer>


      <nav className="mobile-action-bar" aria-label="Quick contact">
        <a
          className="button-whatsapp"
          href={whatsappUrl()}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackContactClick('whatsapp')}
        >
          <WhatsAppIcon size={16} />
          WhatsApp
        </a>
        <a
          className="button-secondary"
          href={CONTACT.phoneHref}
          onClick={() => trackContactClick('phone')}
        >
          <PhoneIcon size={16} />
          Call
        </a>
        <Link className="button-primary" to="/inquire">
          Inquire
        </Link>
      </nav>
    </div>
  )
}
