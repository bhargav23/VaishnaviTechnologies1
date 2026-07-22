import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export function ProjectPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const loadProject = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('is_active', true)
        .maybeSingle()

      if (!alive) {
        return
      }

      if (queryError) {
        setError(queryError.message)
      } else {
        setProject(data)
      }
      setLoading(false)
    }

    loadProject()
    return () => {
      alive = false
    }
  }, [projectId])

  if (loading) {
    return <p className="muted">Loading project details...</p>
  }

  if (error) {
    return <p className="error-box">{error}</p>
  }

  if (!project) {
    return <p className="muted">Project not found.</p>
  }

  return (
    <section className="project-layout">
      <article className="card project-hero-card">
        <div className="card-meta">
          <span className="pill">{project.degree_level?.toUpperCase()}</span>
          <span className="muted"> · {project.domain}</span>
        </div>
        <h1>{project.title}</h1>
        <p className="muted">{project.abstract}</p>
        <p>{project.description}</p>
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
          <Link className="button-primary" to={`/inquire?projectId=${project.id}`}>
            Request Mentorship
          </Link>
          <Link className="button-secondary" to="/catalog">
            Back to Catalog
          </Link>
        </div>
      </article>
      <aside className="project-sidebar">
        <article className="card elevated-card">
          <h3>What students receive</h3>
          <ul className="clean-list">
            <li>Working source code tailored for academic submission</li>
            <li>Report and PPT support for presentation readiness</li>
            <li>Guidance for viva and project explanation</li>
          </ul>
        </article>
        <article className="card elevated-card">
          <h3>Best suited for</h3>
          <p className="muted">
            Students looking for a documented and defensible project in the{' '}
            {project.domain} domain.
          </p>
        </article>
      </aside>
    </section>
  )
}
