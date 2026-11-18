import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { isUuid } from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function NotFoundMessage() {
  return (
    <section className="page-header">
      <h1>Project not found</h1>
      <p className="page-lead">
        This project may have been removed or the link is incorrect.
      </p>
      <div className="actions-row">
        <Link className="button-primary" to="/catalog">
          Browse Project Catalog
        </Link>
        <Link className="button-secondary" to="/inquire">
          Request Mentorship
        </Link>
      </div>
    </section>
  )
}

export function ProjectPage() {
  const { projectId } = useParams()
  // A malformed ID can never match a project; skip the query (Supabase would
  // reject it with a raw "invalid input syntax for type uuid" error).
  const validId = isUuid(projectId)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!validId || !isSupabaseConfigured || !supabase) {
      return undefined
    }

    let alive = true
    const loadProject = async () => {
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
        setError('We could not load this project right now. Please try again shortly.')
      } else {
        setProject(data)
      }
      setLoading(false)
    }

    loadProject()
    return () => {
      alive = false
    }
  }, [projectId, validId])

  useDocumentMeta({
    title: project ? `${project.title} (${project.degree_level?.toUpperCase()} ${project.domain})` : 'Project Details',
    description: project ? truncate(project.abstract, 155) : undefined,
    path: `/project/${projectId}`,
    noindex: !project,
  })

  if (!validId) {
    return <NotFoundMessage />
  }

  if (loading) {
    return <p className="muted">Loading project details...</p>
  }

  if (error) {
    return <p className="error-box">{error}</p>
  }

  if (!project) {
    return <NotFoundMessage />
  }

  return (
    <section className="project-layout">
      <article className="card project-hero-card">
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
