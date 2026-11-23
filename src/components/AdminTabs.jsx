import { NavLink } from 'react-router-dom'

// Tabs shown at the top of every admin page.
export function AdminTabs() {
  const tabClass = ({ isActive }) => (isActive ? 'admin-tab is-active' : 'admin-tab')
  return (
    <nav className="admin-tabs" aria-label="Admin sections">
      <NavLink to="/admin/inquiries" className={tabClass}>
        Inquiries
      </NavLink>
      <NavLink to="/admin/projects" className={tabClass}>
        Projects
      </NavLink>
    </nav>
  )
}
