import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
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

export function DashboardPage() {
  const { user } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const loadInquiries = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase
        .from('inquiries')
        .select(
          'id,status,message,created_at,projects(title,domain,degree_level)',
        )
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (!alive) {
        return
      }
      if (queryError) {
        setError(queryError.message)
      } else {
        setInquiries(data ?? [])
      }
      setLoading(false)
    }
    loadInquiries()

    return () => {
      alive = false
    }
  }, [user.id])

  const pendingCount = inquiries.filter((item) => item.status === 'pending').length
  const activeCount = inquiries.filter((item) => item.status === 'active').length
  const completedCount = inquiries.filter(
    (item) => item.status === 'completed',
  ).length

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Student Dashboard</p>
        <h1>Track your project requests</h1>
        <p className="page-lead">
          Review the latest status of every mentorship inquiry from one place.
        </p>
      </section>
      <section className="stats-grid dashboard-stats">
        <article className="stat-card light-stat">
          <strong>{inquiries.length}</strong>
          <span>Total requests</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{pendingCount}</strong>
          <span>Pending approval</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{activeCount}</strong>
          <span>Active mentorships</span>
        </article>
        <article className="stat-card light-stat">
          <strong>{completedCount}</strong>
          <span>Completed requests</span>
        </article>
      </section>
      <p className="muted">
        Track your mentorship requests and latest progress from the admin team.
      </p>
      {error ? <div className="error-box">{error}</div> : null}
      {loading ? <p className="muted">Loading your requests...</p> : null}
      {!loading && !inquiries.length ? (
        <p className="muted">No mentorship requests submitted yet.</p>
      ) : null}

      <section className="grid">
        {inquiries.map((inquiry) => (
          <article className="card elevated-card" key={inquiry.id}>
            <div className={statusClass(inquiry.status)}>
              {inquiry.status?.toUpperCase()}
            </div>
            <h3>{inquiry.projects?.title ?? 'General inquiry'}</h3>
            <p className="muted">
              {inquiry.projects?.domain} ·{' '}
              {inquiry.projects?.degree_level?.toUpperCase()}
            </p>
            <p>{inquiry.message}</p>
            <p className="muted">
              Requested on {new Date(inquiry.created_at).toLocaleDateString()}
            </p>
          </article>
        ))}
      </section>
    </>
  )
}
