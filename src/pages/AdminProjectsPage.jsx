import { useEffect, useMemo, useState } from 'react'
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
  const [editingId, setEditingId] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('all')
  const [domainFilter, setDomainFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

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

  const saveProject = async (event) => {
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

    const payload = {
      title: form.title.trim(),
      degree_level: form.degree_level,
      domain: form.domain.trim(),
      abstract: form.abstract.trim(),
      description: form.description.trim(),
      tags,
    }

    const { error: saveError } = editingId
      ? await supabase.from('projects').update(payload).eq('id', editingId)
      : await supabase.from('projects').insert({ ...payload, is_active: true })

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    setForm(defaultForm)
    setEditingId('')
    setSuccess(editingId ? 'Project updated successfully.' : 'Project added successfully.')
    await loadProjects()
  }

  const startEdit = (project) => {
    setError('')
    setSuccess('')
    setEditingId(project.id)
    setForm({
      title: project.title ?? '',
      degree_level: project.degree_level ?? 'btech',
      domain: project.domain ?? '',
      abstract: project.abstract ?? '',
      description: project.description ?? '',
      tags: project.tags?.join(', ') ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId('')
    setForm(defaultForm)
    setError('')
    setSuccess('')
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

  const domainOptions = useMemo(
    () =>
      Array.from(new Set(projects.map((project) => project.domain).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [projects],
  )

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return projects.filter((project) => {
      if (degreeFilter !== 'all' && project.degree_level !== degreeFilter) {
        return false
      }
      if (domainFilter !== 'all' && project.domain !== domainFilter) {
        return false
      }
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active'
        if (Boolean(project.is_active) !== isActive) {
          return false
        }
      }
      if (term && !project.title?.toLowerCase().includes(term)) {
        return false
      }
      return true
    })
  }, [projects, degreeFilter, domainFilter, statusFilter, searchTerm])

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
        <h2>{editingId ? 'Edit Project' : 'Add Project'}</h2>
        <form className="form-grid form-grid-two" onSubmit={saveProject}>
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
          <div className="actions-row form-span-two">
            <button type="submit" className="button-primary" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Project'
                  : 'Add Project'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="button-secondary"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <h2 className="section-title">Current Projects</h2>

      <div className="form-wrap filter-panel">
        <label className="compact-field">
          <span>Degree level</span>
          <select
            value={degreeFilter}
            onChange={(event) => setDegreeFilter(event.target.value)}
          >
            <option value="all">All</option>
            {DEGREE_OPTIONS.map((degree) => (
              <option key={degree} value={degree}>
                {degree.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-field">
          <span>Domain</span>
          <select
            value={domainFilter}
            onChange={(event) => setDomainFilter(event.target.value)}
          >
            <option value="all">All</option>
            {domainOptions.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-field">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="compact-field">
          <span>Search title</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title..."
          />
        </label>
        <div className="results-chip">
          {loading
            ? 'Loading...'
            : `${filteredProjects.length} of ${projects.length} project${projects.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {loading ? <p className="muted">Loading projects...</p> : null}
      {!loading && !projects.length ? (
        <p className="muted">No catalog projects found yet.</p>
      ) : null}
      {!loading && projects.length > 0 && !filteredProjects.length ? (
        <p className="muted">No projects match the current filters.</p>
      ) : null}
      <section className="grid">
        {filteredProjects.map((project) => (
          <article className="card elevated-card catalog-card" key={project.id}>
            <div className="card-meta">
              {project.degree_level ? (
                <span className="pill">{project.degree_level.toUpperCase()}</span>
              ) : null}
              {project.domain ? (
                <span className="muted">
                  {project.degree_level ? ' · ' : ''}
                  {project.domain}
                </span>
              ) : null}
              {!project.is_active ? (
                <span className="muted"> · Inactive</span>
              ) : null}
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
            <div className="actions-row">
              <button
                type="button"
                className="button-secondary"
                onClick={() => startEdit(project)}
              >
                Edit
              </button>
              <button
                type="button"
                className="button-danger"
                disabled={deletingId === project.id}
                onClick={() => deleteProject(project.id)}
              >
                {deletingId === project.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}