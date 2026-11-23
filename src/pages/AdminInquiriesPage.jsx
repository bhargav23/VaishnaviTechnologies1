import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminTabs } from '../components/AdminTabs.jsx'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons.jsx'
import {
  CONTACT,
  INQUIRY_STATUS,
  STUDENT_DEGREE_OPTIONS,
  degreeLabel,
} from '../lib/constants.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const submittedFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
})

function formatSubmitted(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : `${submittedFormat.format(date)} IST`
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// A mailto link that opens a reply to the student with their message quoted.
function replyHref(inquiry) {
  const firstName = (inquiry.name || '').trim().split(/\s+/)[0] || 'there'
  const about = inquiry.projects?.title ? ` about "${inquiry.projects.title}"` : ''
  const subject = `Re: Your ${degreeLabel(inquiry.degree)} mentorship inquiry — Vaishnavi Technologies`
  const body = [
    `Hi ${firstName},`,
    '',
    `Thank you for your inquiry${about}.`,
    '',
    '',
    '',
    'Regards,',
    'Vaishnavi Technologies',
    `${CONTACT.phoneDisplay} · ${CONTACT.email}`,
    'https://vaishnavitech.in',
    '',
    `--- Your message (${formatSubmitted(inquiry.created_at)}) ---`,
    inquiry.message ?? '',
  ].join('\n')
  return `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// Phone numbers are stored as digits with an optional leading "+". A bare
// 10-digit number (or one with a leading 0) is treated as Indian (+91).
function internationalDigits(phone) {
  const raw = String(phone ?? '').trim()
  const digits = raw.replace(/\D/g, '')
  if (!digits) {
    return ''
  }
  if (raw.startsWith('+')) {
    return digits
  }
  if (digits.length === 10) {
    return `91${digits}`
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`
  }
  return digits
}

function displayPhone(phone) {
  const digits = internationalDigits(phone)
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return digits ? `+${digits}` : ''
}

function whatsappReplyHref(inquiry) {
  const firstName = (inquiry.name || '').trim().split(/\s+/)[0] || 'there'
  const about = inquiry.projects?.title ? ` about "${inquiry.projects.title}"` : ''
  const text = `Hi ${firstName}, this is Vaishnavi Technologies. Thank you for your ${degreeLabel(inquiry.degree)} inquiry${about}.`
  return `https://wa.me/${internationalDigits(inquiry.phone)}?text=${encodeURIComponent(text)}`
}

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
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [success, setSuccess] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [degreeFilter, setDegreeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchInquiries = () =>
    supabase
      .from('inquiries')
      .select(
        'id,name,email,phone,degree,message,status,created_at,projects(id,title,domain)',
      )
      .order('created_at', { ascending: false })

  const applyInquiries = ({ data, error: queryError }) => {
    if (queryError) {
      setError(queryError.message)
      setInquiries([])
    } else {
      setInquiries(data ?? [])
    }
    setLoading(false)
  }

  const loadInquiries = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return
    }
    setLoading(true)
    applyInquiries(await fetchInquiries())
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }
    let alive = true
    fetchInquiries().then((result) => {
      if (alive) {
        applyInquiries(result)
      }
    })
    return () => {
      alive = false
    }
    // Load once on mount; later refreshes go through loadInquiries().
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
          inquiry.phone,
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

  const deleteInquiry = async (inquiry) => {
    if (!supabase) {
      setError('Supabase configuration is missing.')
      return
    }
    setError('')
    setSuccess('')
    setUpdatingId(inquiry.id)
    const { data, error: deleteError } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', inquiry.id)
      .select('id')
    setUpdatingId('')
    setConfirmDeleteId('')
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    // Row-level security returns no rows (instead of an error) when the
    // delete is not allowed, so check that something was actually removed.
    if (!data?.length) {
      setError('This inquiry could not be deleted. Make sure you are signed in as an admin.')
      return
    }
    setInquiries((current) => current.filter((item) => item.id !== inquiry.id))
    setSuccess(`Deleted the inquiry from ${inquiry.name}.`)
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
      <AdminTabs />
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
      {error ? (
        <div className="error-box" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="success-box" role="status">
          {success}
        </div>
      ) : null}

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
                {statusLabel(status)}
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
            {STUDENT_DEGREE_OPTIONS.map((degree) => (
              <option key={degree} value={degree}>
                {degreeLabel(degree)}
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
            placeholder="Name, email, phone, or project..."
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
        <table className="inquiry-table">
          <thead>
            <tr>
              <th scope="col">Submitted</th>
              <th scope="col">Student</th>
              <th scope="col">Project</th>
              <th scope="col">Requirement</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="nowrap">
                  <time dateTime={inquiry.created_at}>{formatSubmitted(inquiry.created_at)}</time>
                </td>
                <td>
                  <strong>{inquiry.name}</strong>
                  <div>
                    <a className="text-link" href={`mailto:${inquiry.email}`}>
                      {inquiry.email}
                    </a>
                  </div>
                  {inquiry.phone ? (
                    <div>
                      <a className="text-link" href={`tel:+${internationalDigits(inquiry.phone)}`}>
                        {displayPhone(inquiry.phone)}
                      </a>
                    </div>
                  ) : null}
                  <div className="muted">{degreeLabel(inquiry.degree)}</div>
                </td>
                <td>
                  {inquiry.projects?.id ? (
                    <Link className="text-link" to={`/project/${inquiry.projects.id}`}>
                      {inquiry.projects.title}
                    </Link>
                  ) : (
                    <strong>Own topic / general</strong>
                  )}
                  {inquiry.projects?.domain ? (
                    <div className="muted">{inquiry.projects.domain}</div>
                  ) : null}
                </td>
                <td className="requirement-cell">{inquiry.message}</td>
                <td>
                  <label className="visually-hidden" htmlFor={`status-${inquiry.id}`}>
                    Status for {inquiry.name}
                  </label>
                  <select
                    id={`status-${inquiry.id}`}
                    className={`status-select ${statusClass(inquiry.status)}`}
                    value={inquiry.status}
                    disabled={updatingId === inquiry.id}
                    onChange={(event) => updateStatus(inquiry.id, event.target.value)}
                  >
                    {INQUIRY_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {confirmDeleteId === inquiry.id ? (
                    <div className="row-actions">
                      <span className="muted">Delete permanently?</span>
                      <button
                        type="button"
                        className="button-danger button-small"
                        disabled={updatingId === inquiry.id}
                        onClick={() => deleteInquiry(inquiry)}
                      >
                        {updatingId === inquiry.id ? 'Deleting...' : 'Yes, delete'}
                      </button>
                      <button
                        type="button"
                        className="button-secondary button-small"
                        onClick={() => setConfirmDeleteId('')}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="row-actions">
                      <a
                        className="button-primary button-small"
                        href={replyHref(inquiry)}
                        title="Opens your email app with a reply ready. Set Zoho Mail as your email app so it goes from info@vaishnavitech.in."
                      >
                        <MailIcon size={16} />
                        Reply
                      </a>
                      {inquiry.phone ? (
                        <>
                          <a
                            className="button-secondary button-small button-whatsapp-outline"
                            href={whatsappReplyHref(inquiry)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`WhatsApp ${inquiry.name}`}
                          >
                            <WhatsAppIcon size={16} />
                            WhatsApp
                          </a>
                          <a
                            className="button-secondary button-small"
                            href={`tel:+${internationalDigits(inquiry.phone)}`}
                            aria-label={`Call ${inquiry.name}`}
                          >
                            <PhoneIcon size={16} />
                            Call
                          </a>
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="button-secondary button-small button-danger-outline"
                        aria-label={`Delete inquiry from ${inquiry.name}`}
                        onClick={() => setConfirmDeleteId(inquiry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
