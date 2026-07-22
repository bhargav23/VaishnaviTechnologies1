import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { DEGREE_OPTIONS } from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const initialForm = {
  name: '',
  email: '',
  degree: 'btech',
  message: '',
  projectId: '',
}

export function InquirePage() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedProjectId = useMemo(
    () => searchParams.get('projectId') ?? '',
    [searchParams],
  )

  useEffect(() => {
    let alive = true
    const loadProjects = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase configuration is missing.')
        setProjects([])
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase
        .from('projects')
        .select('id,title')
        .eq('is_active', true)
        .order('title')
      if (!alive) {
        return
      }
      if (queryError) {
        setError(queryError.message)
      } else {
        setProjects(data ?? [])
        setForm((current) => ({
          ...current,
          projectId: selectedProjectId || current.projectId || data?.[0]?.id || '',
        }))
      }
      setLoading(false)
    }
    loadProjects()
    return () => {
      alive = false
    }
  }, [selectedProjectId])

  useEffect(() => {
    if (!user) {
      return
    }
    setForm((current) => ({
      ...current,
      name: profile?.full_name || current.name,
      email: user.email || current.email,
      degree: profile?.degree || current.degree,
    }))
  }, [user, profile])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setError('Supabase configuration is missing.')
      return
    }
    if (!form.projectId) {
      setError('No active projects are available to request right now.')
      return
    }
    setError('')
    setSuccess(false)
    setSubmitting(true)

    const { error: insertError } = await supabase.from('inquiries').insert({
      student_id: user?.id ?? null,
      project_id: form.projectId,
      name: form.name.trim(),
      email: form.email.trim(),
      degree: form.degree,
      message: form.message.trim(),
      status: 'pending',
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setSuccess(true)
    setForm((current) => ({
      ...current,
      message: '',
    }))
  }

  return (
    <section className="split-layout">
      <aside className="info-panel">
        <p className="eyebrow">Mentorship Request</p>
        <h1>Tell us what you need</h1>
        <p className="page-lead">
          Share your project choice, timeline, and academic requirement. We use
          this form to qualify the request before mentorship approval.
        </p>
        <div className="info-list">
          <div className="info-list-item">
            <strong>Ready-made projects</strong>
            <span>Best for fast customization and quicker delivery.</span>
          </div>
          <div className="info-list-item">
            <strong>Custom projects</strong>
            <span>For unique requirements, domain focus, and batch variation.</span>
          </div>
          <div className="info-list-item">
            <strong>Guided support</strong>
            <span>For students who want mentoring while building themselves.</span>
          </div>
        </div>
      </aside>
      <div className="form-wrap spotlight-panel">
        {error ? <div className="error-box">{error}</div> : null}
        {success ? (
          <div className="success-box">
            Your inquiry was submitted successfully.
          </div>
        ) : null}

        {loading ? (
          <p className="muted">Loading inquiry form...</p>
        ) : !projects.length ? (
          <div className="error-box">
            No active projects are available right now. Add a catalog project
            first, then accept inquiries.
          </div>
        ) : (
          <form className="form-grid" onSubmit={onSubmit}>
            <label className="compact-field">
              Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="compact-field">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>
            <label className="compact-field">
              Degree
              <select
                value={form.degree}
                onChange={(event) =>
                  setForm((current) => ({ ...current, degree: event.target.value }))
                }
              >
                {DEGREE_OPTIONS.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="compact-field">
              Project
              <select
                required
                value={form.projectId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    projectId: event.target.value,
                  }))
                }
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="compact-field">
              Message / Requirement
              <textarea
                required
                placeholder="Share your expected timeline, domain preferences, and requirement details."
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
              />
            </label>
            <button
              className="button-primary"
              type="submit"
              disabled={submitting || !form.projectId}
            >
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
