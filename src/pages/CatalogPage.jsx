import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEGREE_OPTIONS } from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const PAGE_SIZE = 6

export function CatalogPage() {
  const [degreeFilter, setDegreeFilter] = useState('all')
  const [domainFilter, setDomainFilter] = useState('all')
  const [domainOptions, setDomainOptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let alive = true
    const loadDomains = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return
      }
      const { data, error: domainError } = await supabase
        .from('projects')
        .select('domain')
        .eq('is_active', true)

      if (!alive || domainError || !data) {
        return
      }

      const uniqueDomains = Array.from(
        new Set(data.map((row) => row.domain).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b))

      setDomainOptions(uniqueDomains)
    }

    loadDomains()
    return () => {
      alive = false
    }
  }, [])

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

      if (domainFilter !== 'all') {
        query = query.eq('domain', domainFilter)
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
  }, [degreeFilter, domainFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [degreeFilter, domainFilter, searchTerm])

  const searchedProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      return projects
    }
    return projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(term) ||
        project.abstract?.toLowerCase().includes(term),
    )
  }, [projects, searchTerm])

  const totalPages = Math.max(1, Math.ceil(searchedProjects.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const visibleProjects = searchedProjects.slice(pageStart, pageStart + PAGE_SIZE)

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
          <span>Search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title or keyword..."
          />
        </label>
        <div className="results-chip">
          {loading
            ? 'Loading...'
            : `${searchedProjects.length} project${searchedProjects.length === 1 ? '' : 's'} found`}
        </div>
      </div>

      {error ? <p className="error-box">{error}</p> : null}
      {loading ? <p className="muted">Loading projects...</p> : null}
      {!loading && !searchedProjects.length ? (
        <p className="muted">No active projects found for this filter.</p>
      ) : null}

      <section className="grid">
        {visibleProjects.map((project) => (
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

      {!loading && searchedProjects.length > PAGE_SIZE ? (
        <nav className="pagination" aria-label="Catalog pagination">
          <button
            type="button"
            className="pagination-button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              type="button"
              key={page}
              className={`pagination-button${page === safePage ? ' is-active' : ''}`}
              onClick={() => setCurrentPage(page)}
              aria-current={page === safePage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="pagination-button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </nav>
      ) : null}
    </>
  )
}