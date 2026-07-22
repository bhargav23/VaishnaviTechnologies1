import { useEffect, useState } from 'react'
import { DEGREE_OPTIONS } from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const defaultForm = {
  title: '',
  degree_level: 'btech',
  domain: '',
  abstract: '',
  description: '',
  tags: '',
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const loadProjects = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProjects([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (queryError) {
      setError(queryError.message)
      setProjects([])
    } else {
      setProjects(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const createProject = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setError('Supabase configuration is missing.')
      return
    }
    setError('')
    setSuccess('')
    setSaving(true)
    const tags = form.tags
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const { error: insertError } = await supabase.from('projects').insert({
      title: form.title.trim(),
      degree_level: form.degree_level,
      domain: form.domain.trim(),
      abstract: form.abstract.trim(),
      description: form.description.trim(),
      tags,
      is_active: true,
    })

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setForm(defaultForm)
    setSuccess('Project added successfully.')
    await loadProjects()
  }

  const deleteProject = async (projectId) => {
    if (!supabase) {
      setError('Supabase configuration is missing.')
      return
    }
    setError('')
    setSuccess('')
    setDeletingId(projectId)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    setDeletingId('')

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setSuccess('Project deleted successfully.')
    await loadProjects()
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Admin Panel</p>
        <h1>Project catalog management</h1>
        <p className="page-lead">
          Add new project offerings, maintain catalog quality, and keep active
          listings current.
        </p>
      </section>
      <section className="stats-grid dashboard-stats">
        <article className="stat-card light-stat">
          <strong>{projects.length}</strong>
          <span>Total catalog projects</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{projects.filter((project) => project.degree_level === 'btech').length}</strong>
          <span>B.Tech projects</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{projects.filter((project) => project.degree_level === 'mtech').length}</strong>
          <span>M.Tech projects</span>
        </article>
      </section>
      {error ? <div className="error-box">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}

      <section className="form-wrap spotlight-panel">
        <h2>Add Project</h2>
        <form className="form-grid form-grid-two" onSubmit={createProject}>
          <label className="compact-field">
            Title
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className="compact-field">
            Degree
            <select
              value={form.degree_level}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  degree_level: event.target.value,
                }))
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
            Domain
            <input
              required
              value={form.domain}
              onChange={(event) =>
                setForm((current) => ({ ...current, domain: event.target.value }))
              }
            />
          </label>
          <label className="compact-field form-span-two">
            Abstract
            <textarea
              required
              value={form.abstract}
              onChange={(event) =>
                setForm((current) => ({ ...current, abstract: event.target.value }))
              }
            />
          </label>
          <label className="compact-field form-span-two">
            Full description
            <textarea
              required
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label className="compact-field form-span-two">
            Tags (comma-separated)
            <input
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({ ...current, tags: event.target.value }))
              }
              placeholder="docker, kubernetes, ci/cd"
            />
          </label>
          <button type="submit" className="button-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add Project'}
          </button>
        </form>
      </section>

      <h2 className="section-title">Current Projects</h2>
      {loading ? <p className="muted">Loading projects...</p> : null}
      {!loading && !projects.length ? (
        <p className="muted">No catalog projects found yet.</p>
      ) : null}
      <section className="grid">
        {projects.map((project) => (
          <article className="card elevated-card catalog-card" key={project.id}>
            <div className="card-meta">
              <span className="pill">{project.degree_level?.toUpperCase()}</span>
              <span className="muted"> · {project.domain}</span>
            </div>
            <h3>{project.title}</h3>
            <p className="muted">{project.abstract}</p>
            <div className="tag-row">
              {project.tags?.length ? (
                project.tags.map((tag) => (
                  <span className="soft-pill" key={tag}>
                    {tag}
                  </span>
                ))
              ) : (
                <span className="muted">No tags added</span>
              )}
            </div>
            <button
              type="button"
              className="button-danger"
              disabled={deletingId === project.id}
              onClick={() => deleteProject(project.id)}
            >
              {deletingId === project.id ? 'Deleting...' : 'Delete'}
            </button>
          </article>
        ))}
      </section>
    </>
  )
}
