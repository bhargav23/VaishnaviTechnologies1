import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AdminInquiriesPage } from './pages/AdminInquiriesPage.jsx'
import { AdminProjectsPage } from './pages/AdminProjectsPage.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { InquirePage } from './pages/InquirePage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProjectPage } from './pages/ProjectPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/inquire" element={<InquirePage />} />
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
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
