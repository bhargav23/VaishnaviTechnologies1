import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function useMode() {
  const { search } = useLocation()
  return new URLSearchParams(search).get('mode') === 'signup' ? 'signup' : 'signin'
}

export function AuthPage() {
  const mode = useMode()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    degree: 'btech',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const result = await signUp(form)
        if (result.requiresEmailConfirmation) {
          setSuccess(
            'Account created. Please confirm your email before signing in.',
          )
          return
        }
      } else {
        await signIn(form)
      }
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="split-layout auth-layout">
      <aside className="info-panel">
        <p className="eyebrow">Student Access</p>
        <h1>{mode === 'signup' ? 'Create your student account' : 'Welcome back'}</h1>
        <p className="page-lead">
          Sign in to track mentorship requests, monitor status updates, and keep
          all project communication in one place.
        </p>
        <div className="info-list">
          <div className="info-list-item">
            <strong>Private dashboard</strong>
            <span>View submitted requests and current approval status.</span>
          </div>
          <div className="info-list-item">
            <strong>Structured follow-up</strong>
            <span>Keep project communication organized after inquiry.</span>
          </div>
        </div>
      </aside>
      <section className="form-wrap spotlight-panel">
        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}
        <form className="form-grid" onSubmit={onSubmit}>
          {mode === 'signup' ? (
            <>
              <label className="compact-field">
                Full Name
                <input
                  required
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="compact-field">
                Degree
                <select
                  value={form.degree}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, degree: event.target.value }))
                  }
                >
                  <option value="btech">B.Tech</option>
                  <option value="mtech">M.Tech</option>
                </select>
              </label>
            </>
          ) : null}
          <label className="compact-field">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label className="compact-field">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </label>
          <button type="submit" className="button-primary" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'signup'
                ? 'Create Account'
                : 'Login'}
          </button>
        </form>
        <p className="muted">
          {mode === 'signup' ? (
            <>
              Already have an account? <Link to="/auth?mode=signin">Login</Link>
            </>
          ) : (
            <>
              New student? <Link to="/auth?mode=signup">Create account</Link>
            </>
          )}
        </p>
      </section>
    </section>
  )
}
