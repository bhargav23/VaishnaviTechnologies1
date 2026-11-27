import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { ContactPage } from './pages/ContactPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { InquirePage } from './pages/InquirePage.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProjectPage } from './pages/ProjectPage.jsx'
import { LANDING_PAGE_KEYS, PAGE_META } from './lib/pageMeta.js'

// Sign-in, the student dashboard and the admin pages are loaded only when
// someone opens them, so visitors don't download that code.
const AuthPage = lazy(() =>
  import('./pages/AuthPage.jsx').then((module) => ({ default: module.AuthPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage.jsx').then((module) => ({ default: module.DashboardPage })),
)
const AdminProjectsPage = lazy(() =>
  import('./pages/AdminProjectsPage.jsx').then((module) => ({
    default: module.AdminProjectsPage,
  })),
)
const AdminInquiriesPage = lazy(() =>
  import('./pages/AdminInquiriesPage.jsx').then((module) => ({
    default: module.AdminInquiriesPage,
  })),
)

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/inquire" element={<InquirePage />} />
        <Route path="/contact" element={<ContactPage />} />
        {LANDING_PAGE_KEYS.map((key) => (
          // The key makes React start fresh (form degree, project list) when
          // moving between landing pages.
          <Route
            key={key}
            path={PAGE_META[key].path}
            element={<LandingPage key={key} pageKey={key} />}
          />
        ))}
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute requireAdmin>
              <AdminProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inquiries"
          element={
            <ProtectedRoute requireAdmin>
              <AdminInquiriesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/projects" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App