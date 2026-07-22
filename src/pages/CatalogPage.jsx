import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEGREE_OPTIONS } from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export function CatalogPage() {
  const [degreeFilter, setDegreeFilter] = useState('all')
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const loadProjects = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setProjects([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      let query = supabase
        .from('projects')
        .select('id,title,degree_level,domain,abstract,tags')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (degreeFilter !== 'all') {
        query = query.eq('degree_level', degreeFilter)
      }

      const { data, error: queryError } = await query
      if (!alive) {
        return
      }

      if (queryError) {
        setError(queryError.message)
        setProjects([])
      } else {
        setProjects(data ?? [])
      }
      setLoading(false)
    }

    loadProjects()
    return () => {
      alive = false
    }
  }, [degreeFilter])

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Project Catalog</p>
        <h1>Discover curated B.Tech and M.Tech project options</h1>
        <p className="page-lead">
          Filter by degree level and explore projects prepared for academic
          delivery, documentation, and viva support.
        </p>
      </section>
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
        <div className="results-chip">
          {loading ? 'Loading...' : `${projects.length} project${projects.length === 1 ? '' : 's'} found`}
        </div>
      </div>

      {error ? <p className="error-box">{error}</p> : null}
      {loading ? <p className="muted">Loading projects...</p> : null}
      {!loading && !projects.length ? (
        <p className="muted">No active projects found for this filter.</p>
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
                <span className="muted">Technologies not listed</span>
              )}
            </div>
            <div className="actions-row">
              <Link className="button-secondary" to={`/project/${project.id}`}>
                View Details
              </Link>
              <Link
                className="button-primary"
                to={`/inquire?projectId=${project.id}`}
              >
                Inquire Now
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
