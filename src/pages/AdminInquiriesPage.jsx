import { useEffect, useMemo, useState } from 'react'
import { DEGREE_OPTIONS, INQUIRY_STATUS } from '../lib/constants.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function statusClass(status) {
  if (status === 'active') {
    return 'pill status-active'
  }
  if (status === 'completed') {
    return 'pill status-completed'
  }
  return 'pill status-pending'
}

export function AdminInquiriesPage() {
  useDocumentMeta({
    title: 'Admin — Inquiries',
    path: '/admin/inquiries',
    noindex: true,
  })
  const [inquiries, setInquiries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [degreeFilter, setDegreeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const loadInquiries = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setInquiries([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('inquiries')
      .select(
        'id,name,email,degree,message,status,created_at,projects(title,domain)',
      )
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(queryError.message)
      setInquiries([])
    } else {
      setInquiries(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInquiries()
  }, [])

  const pendingCount = inquiries.filter((item) => item.status === 'pending').length
  const activeCount = inquiries.filter((item) => item.status === 'active').length
  const completedCount = inquiries.filter(
    (item) => item.status === 'completed',
  ).length

  const filteredInquiries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return inquiries.filter((inquiry) => {
      if (statusFilter !== 'all' && inquiry.status !== statusFilter) {
        return false
      }
      if (degreeFilter !== 'all' && inquiry.degree !== degreeFilter) {
        return false
      }
      if (term) {
        const haystack = [
          inquiry.name,
          inquiry.email,
          inquiry.projects?.title,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(term)) {
          return false
        }
      }
      return true
    })
  }, [inquiries, statusFilter, degreeFilter, searchTerm])

  const updateStatus = async (inquiryId, status) => {
    if (!supabase) {
      setError('Supabase configuration is missing.')
      return
    }
    setError('')
    setSuccess('')
    setUpdatingId(inquiryId)
    const { error: updateError } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', inquiryId)
    setUpdatingId('')
    if (updateError) {
      setError(updateError.message)
      return
    }
    setSuccess('Inquiry status updated successfully.')
    await loadInquiries()
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Admin Panel</p>
        <h1>Student inquiries</h1>
        <p className="page-lead">
          Review incoming leads, check project interest, and update request
          status for student visibility.
        </p>
      </section>
      <section className="stats-grid dashboard-stats">
        <article className="stat-card light-stat">
          <strong>{inquiries.length}</strong>
          <span>Total inquiries</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{pendingCount}</strong>
          <span>Pending</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{activeCount}</strong>
          <span>Active</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{completedCount}</strong>
          <span>Completed</span>
        </article>
      </section>
      {error ? <div className="error-box">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}

      <div className="form-wrap filter-panel">
        <label className="compact-field">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            {INQUIRY_STATUS.map((status) => (
              <option key={status} value={status}>
                {status.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-field">
          <span>Degree</span>
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
          <span>Search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Name, email, or project..."
          />
        </label>
        <div className="results-chip">
          {loading
            ? 'Loading...'
            : `${filteredInquiries.length} of ${inquiries.length} inquir${inquiries.length === 1 ? 'y' : 'ies'}`}
        </div>
      </div>

      {loading ? <p className="muted">Loading inquiries...</p> : null}
      {!loading && !inquiries.length ? (
        <p className="muted">No student inquiries have been submitted yet.</p>
      ) : null}
      {!loading && inquiries.length > 0 && !filteredInquiries.length ? (
        <p className="muted">No inquiries match the current filters.</p>
      ) : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Project</th>
              <th>Requirement</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>
                  <strong>{inquiry.name}</strong>
                  <div className="muted">{inquiry.email}</div>
                  <div className="muted">{inquiry.degree.toUpperCase()}</div>
                </td>
                <td>
                  <strong>{inquiry.projects?.title ?? 'General inquiry'}</strong>
                  <div className="muted">{inquiry.projects?.domain ?? 'N/A'}</div>
                </td>
                <td>{inquiry.message}</td>
                <td>
                  <div className={statusClass(inquiry.status)}>
                    {inquiry.status.toUpperCase()}
                  </div>
                  <select
                    value={inquiry.status}
                    disabled={updatingId === inquiry.id}
                    onChange={(event) =>
                      updateStatus(inquiry.id, event.target.value)
                    }
                  >
                    {INQUIRY_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
