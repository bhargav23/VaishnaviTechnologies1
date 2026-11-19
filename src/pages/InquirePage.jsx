import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { trackContactClick, trackLead } from '../lib/analytics.js'
import {
  CONTACT,
  STUDENT_DEGREE_OPTIONS,
  degreeLabel,
  whatsappUrl,
} from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

// Value of the "not in the catalog" choice in the project dropdown. It is
// stored as a NULL project_id.
const OWN_TOPIC = ''

const initialForm = {
  name: '',
  email: '',
  degree: 'btech',
  message: '',
}

function friendlyInsertError(insertError) {
  // 23514 = check constraint, 23502 = not-null constraint. These mean the
  // database has not been migrated for this request type yet (see
  // supabase/migrations) or a field is outside the allowed limits.
  if (insertError?.code === '23514' || insertError?.code === '23502') {
    return `We couldn't save this request right now. Please message us on WhatsApp or call ${CONTACT.phoneDisplay} and we'll help you directly.`
  }
  return insertError?.message || 'Something went wrong. Please try again.'
}

export function InquirePage() {
  useDocumentMeta({
    title: 'Request Mentorship',
    description:
      'Submit your B.Tech, M.Tech or PhD project or research requirement and get matched with the right mentorship track: catalog, custom-built, or guided support.',
    path: '/inquire',
  })

  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const urlProjectId = searchParams.get('projectId') ?? ''
  const urlDegree = searchParams.get('degree')

  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(() => ({
    ...initialForm,
    degree: STUDENT_DEGREE_OPTIONS.includes(urlDegree) ? urlDegree : 'btech',
  }))
  // null = the visitor has not picked anything yet, so fall back to the
  // project in the URL (if it exists) or "own topic".
  const [projectChoice, setProjectChoice] = useState(null)
  const [prefilledFor, setPrefilledFor] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(
    isSupabaseConfigured ? '' : 'Supabase configuration is missing.',
  )
  const [success, setSuccess] = useState(false)

  // Prefill name/email/degree once per signed-in profile. Adjusting state
  // during render (instead of in an effect) avoids an extra render pass.
  const prefillKey = user ? `${user.id}:${profile?.id ?? ''}` : null
  if (prefillKey && prefillKey !== prefilledFor) {
    setPrefilledFor(prefillKey)
    setForm((current) => ({
      ...current,
      name: profile?.full_name || current.name,
      email: user.email || current.email,
      degree: profile?.degree || current.degree,
    }))
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

    let alive = true
    const loadProjects = async () => {
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
      }
      setLoading(false)
    }
    loadProjects()
    return () => {
      alive = false
    }
  }, [])

  const urlProjectExists = projects.some((project) => project.id === urlProjectId)
  const projectId =
    projectChoice ?? (urlProjectExists ? urlProjectId : OWN_TOPIC)

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setError('Supabase configuration is missing.')
      return
    }
    setError('')
    setSuccess(false)
    setSubmitting(true)

    try {
      const { error: insertError } = await supabase.from('inquiries').insert({
        student_id: user?.id ?? null,
        project_id: projectId || null,
        name: form.name.trim(),
        email: form.email.trim(),
        degree: form.degree,
        message: form.message.trim(),
        status: 'pending',
      })

      if (insertError) {
        setError(friendlyInsertError(insertError))
        return
      }

      trackLead({
        degree: form.degree,
        request_type: projectId ? 'catalog_project' : 'own_topic',
      })
      setSuccess(true)
      setForm((current) => ({
        ...current,
        message: '',
      }))
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="split-layout">
      <aside className="info-panel">
        <p className="eyebrow">Mentorship Request</p>
        <h1>Tell us what you need</h1>
        <p className="page-lead">
          Share your project choice or research topic, timeline, and academic
          requirement. We use this form to understand the request before
          mentorship begins.
        </p>
        <div className="info-list">
          <div className="info-list-item">
            <strong>Catalog projects</strong>
            <span>Start from a tested project and customise it with us.</span>
          </div>
          <div className="info-list-item">
            <strong>Custom projects</strong>
            <span>For unique requirements, domain focus, and batch variation.</span>
          </div>
          <div className="info-list-item">
            <strong>Guided support</strong>
            <span>For students who want mentoring while building themselves.</span>
          </div>
          <div className="info-list-item">
            <strong>PhD research guidance</strong>
            <span>
              Choose PhD as your degree and &ldquo;My own topic&rdquo; as the
              project, then describe your research area.
            </span>
          </div>
        </div>
      </aside>
      <div className="form-wrap spotlight-panel">
        {error ? (
          <div className="error-box" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="success-box" role="status">
            Your inquiry was submitted. We&apos;ll get back to you soon. For a
            faster reply,{' '}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackContactClick('whatsapp')}
            >
              message us on WhatsApp
            </a>
            .
          </div>
        ) : null}

        {loading ? (
          <p className="muted">Loading inquiry form...</p>
        ) : (
          <form className="form-grid" onSubmit={onSubmit}>
            <label className="compact-field">
              Name
              <input
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={form.name}
                onChange={updateField('name')}
              />
            </label>
            <label className="compact-field">
              Email
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={form.email}
                onChange={updateField('email')}
              />
            </label>
            <label className="compact-field">
              Degree
              <select value={form.degree} onChange={updateField('degree')}>
                {STUDENT_DEGREE_OPTIONS.map((degree) => (
                  <option key={degree} value={degree}>
                    {degreeLabel(degree)}
                  </option>
                ))}
              </select>
            </label>
            <label className="compact-field">
              Project
              <select
                value={projectId}
                onChange={(event) => setProjectChoice(event.target.value)}
              >
                <option value={OWN_TOPIC}>
                  My own topic / not in the catalog
                </option>
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
                minLength={1}
                maxLength={5000}
                placeholder={
                  form.degree === 'phd'
                    ? 'Share your research area, current stage (topic selection, experiments, paper, thesis), and timeline.'
                    : 'Share your expected timeline, domain preferences, and requirement details.'
                }
                value={form.message}
                onChange={updateField('message')}
              />
            </label>
            <button
              className="button-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
