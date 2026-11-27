import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, SearchIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { useInitialData } from '../lib/initialData.js'
import { PAGE_META } from '../lib/pageMeta.js'
import { trackContactClick } from '../lib/analytics.js'
import { DEGREE_OPTIONS, degreeLabel, whatsappUrl } from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const PAGE_SIZE = 6

function uniqueDomains(rows) {
  return Array.from(new Set(rows.map((row) => row.domain).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  )
}

export function CatalogPage() {
  useDocumentMeta(PAGE_META.catalog)

  // The prerendered page carries the catalog as it was at build time, so it
  // shows (and search engines see) projects straight away; the effects below
  // then load the live catalog.
  const initialProjects = useInitialData('catalog')
  const [degreeFilter, setDegreeFilter] = useState('all')
  const [domainFilter, setDomainFilter] = useState('all')
  const [domainOptions, setDomainOptions] = useState(() => uniqueDomains(initialProjects ?? []))
  const [searchTerm, setSearchTerm] = useState('')
  const [projects, setProjects] = useState(initialProjects ?? [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!initialProjects)
  const [currentPage, setCurrentPage] = useState(1)
  // Refresh the build-time list quietly instead of flashing "Loading...".
  const quietFirstLoad = useRef(Boolean(initialProjects))

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

      setDomainOptions(uniqueDomains(data))
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

      if (quietFirstLoad.current) {
        quietFirstLoad.current = false
      } else {
        setLoading(true)
      }
      setError('')
      let query = supabase
        .from('projects')
        .select('id,title,degree_level,domain,abstract,tags')
        .eq('is_active', true)
        // B.Tech first (most visitors), newest first within each degree.
        .order('degree_level', { ascending: true })
        .order('created_at', { ascending: false })
        .order('title')

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

  const degreeChoices = ['all', ...DEGREE_OPTIONS]

  return (
    <>
      <section className="bleed page-band">
        <div className="container page-band-inner">
          <div className="intro-heading">
            <p className="eyebrow">Project catalog</p>
            <h1 className="page-title">Find a project to start from</h1>
            <p className="page-lead">
              Filter by degree and domain. Every catalog project can be tailored
              to your requirement, with documentation and viva support.
            </p>
          </div>
          <Link className="text-link" to="/inquire">
            Can&apos;t find your topic? Request a custom project <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      <div className="filter-panel" role="search">
        <div className="compact-field">
          <span id="degree-filter-label">Degree</span>
          <div className="segmented" role="group" aria-labelledby="degree-filter-label">
            {degreeChoices.map((degree) => (
              <button
                type="button"
                key={degree}
                aria-pressed={degreeFilter === degree}
                onClick={() => {
                  setDegreeFilter(degree)
                  setCurrentPage(1)
                }}
              >
                {degree === 'all' ? 'All' : degreeLabel(degree)}
              </button>
            ))}
          </div>
        </div>
        <label className="compact-field">
          <span>Domain</span>
          <select
            value={domainFilter}
            onChange={(event) => {
              setDomainFilter(event.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">All domains</option>
            {domainOptions.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-field search-field">
          <span>Search</span>
          <span className="search-control">
            <SearchIcon />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Title or keyword"
            />
          </span>
        </label>
        <p className="results-chip" aria-live="polite">
          {loading
            ? 'Loading...'
            : `${searchedProjects.length} project${searchedProjects.length === 1 ? '' : 's'} found`}
        </p>
      </div>

      {error ? <p className="error-box">{error}</p> : null}
      {loading ? <p className="muted">Loading projects...</p> : null}
      {!loading && !searchedProjects.length ? (
        <p className="empty-state">No active projects found for this filter.</p>
      ) : null}

      <section className="card-grid card-grid-3" aria-label="Projects">
        {visibleProjects.map((project) => (
          <article className="card catalog-card" key={project.id}>
            <div className="card-meta">
              {project.degree_level ? (
                <span className="pill">{degreeLabel(project.degree_level)}</span>
              ) : null}
              {project.domain ? <span className="muted">{project.domain}</span> : null}
            </div>
            <h2 className="card-title">{project.title}</h2>
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
            <div className="actions-row card-actions">
              <Link className="button-secondary" to={`/project/${project.id}`}>
                View details
              </Link>
              <Link className="button-primary" to={`/inquire?projectId=${project.id}`}>
                Inquire now <ArrowRightIcon size={16} />
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
            Previous
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

      <section className="cta-panel">
        <div>
          <h2>Not in the catalog?</h2>
          <p>
            We build custom projects around your requirement — custom domain
            selection, unique feature combinations, and an implementation you can
            explain and defend.
          </p>
        </div>
        <div className="actions-row">
          <Link className="button-primary" to="/inquire">
            Request a custom project
          </Link>
          <a
            className="button-outline-light"
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackContactClick('whatsapp')}
          >
            <WhatsAppIcon />
            WhatsApp us
          </a>
        </div>
      </section>
    </>
  )
}
