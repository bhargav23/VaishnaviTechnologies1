import { useId } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { HeardFromField, HoneypotField, PhoneField } from './FormFields.jsx'
import { OWN_TOPIC, useInquiryForm } from '../hooks/useInquiryForm.js'
import { trackContactClick } from '../lib/analytics.js'
import {
  BUSINESS,
  STUDENT_DEGREE_OPTIONS,
  degreeLabel,
  whatsappUrl,
} from '../lib/constants.js'

/**
 * The mentorship request form. `compact` is the short version in the home
 * page hero; `full` adds the degree cards and the catalog project picker for
 * the /inquire page. Both save through useInquiryForm.
 */
export function InquiryForm({
  variant = 'full',
  initialDegree = null,
  urlProjectId = '',
}) {
  const compact = variant === 'compact'
  const radioName = useId()
  const { user } = useAuth()
  const {
    form,
    updateField,
    setDegree,
    projects,
    projectId,
    setProjectChoice,
    loading,
    submitting,
    error,
    success,
    onSubmit,
  } = useInquiryForm({ initialDegree, urlProjectId, withProjects: !compact })

  const phoneField = (
    <PhoneField value={form.phone} onChange={updateField('phone')} />
  )

  return (
    <>
      {error ? (
        <div className="error-box" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="success-box" role="status">
          Your inquiry was submitted. We&apos;ll get back to you soon. For a
          faster reply,{' '}
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackContactClick('whatsapp')}
          >
            message us on WhatsApp
          </a>
          .
        </div>
      ) : null}

      {loading ? (
        <p className="muted">Loading inquiry form...</p>
      ) : (
        <form className="form-grid" onSubmit={onSubmit}>
          <div className="form-row-two">
            <label className="compact-field">
              Name
              <input
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={form.name}
                onChange={updateField('name')}
              />
            </label>
            <label className="compact-field">
              Email
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={form.email}
                onChange={updateField('email')}
              />
            </label>
          </div>

          {compact ? (
            <div className="form-row-two">
              {phoneField}
              <label className="compact-field">
                Degree
                <select value={form.degree} onChange={updateField('degree')}>
                  {STUDENT_DEGREE_OPTIONS.map((degree) => (
                    <option key={degree} value={degree}>
                      {degreeLabel(degree)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <>
              {phoneField}
              <fieldset className="degree-fieldset">
                <legend>Degree</legend>
                <div className="degree-options">
                  {STUDENT_DEGREE_OPTIONS.map((degree) => (
                    <label
                      key={degree}
                      className={`degree-option${form.degree === degree ? ' is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={radioName}
                        value={degree}
                        checked={form.degree === degree}
                        onChange={() => setDegree(degree)}
                      />
                      {degreeLabel(degree)}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <HeardFromField value={form.heardFrom} onChange={updateField('heardFrom')} />

          <HoneypotField value={form.website} onChange={updateField('website')} />

          {compact ? null : (
            <label className="compact-field">
              Project
              <select
                value={projectId}
                onChange={(event) => setProjectChoice(event.target.value)}
              >
                <option value={OWN_TOPIC}>My own topic / not in the catalog</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="compact-field">
            {compact ? 'What do you need?' : 'Message / Requirement'}
            <textarea
              required
              minLength={1}
              maxLength={5000}
              rows={compact ? 4 : 6}
              placeholder={
                compact
                  ? 'Domain, requirement, and timeline'
                  : form.degree === 'phd'
                    ? 'Share your research area, current stage (topic selection, experiments, paper, thesis), and timeline.'
                    : 'Share your expected timeline, domain preferences, and requirement details.'
              }
              value={form.message}
              onChange={updateField('message')}
            />
          </label>

          <button className="button-primary button-block" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit inquiry'}
          </button>

          {compact ? (
            <p className="form-note">Open {BUSINESS.hoursShort}</p>
          ) : !user ? (
            <p className="form-note">
              Have an account? <Link to="/auth?mode=signin">Sign in</Link> and
              we&apos;ll fill in your details.
            </p>
          ) : null}
        </form>
      )}
    </>
  )
}
