import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth.js'
import { trackLead } from '../lib/analytics.js'
import { CONTACT, STUDENT_DEGREE_OPTIONS } from '../lib/constants.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

// Value of the "not in the catalog" choice in the project dropdown. It is
// stored as a NULL project_id.
export const OWN_TOPIC = ''

// Bots that fill every field, or submit within a moment of the page
// loading, are treated as spam: they see the normal success message, but
// nothing is saved.
const MIN_FILL_TIME_MS = 3000

function friendlyInsertError(insertError) {
  const text = insertError?.message ?? ''
  if (text.includes('inquiries_phone_format')) {
    return 'Please enter a valid phone number: 10 digits, or with your country code (for example +91 98765 43210).'
  }
  if (text.includes('inquiries_email_format')) {
    return 'Please enter a valid email address.'
  }
  // 23514 = check constraint, 23502 = not-null constraint. These mean the
  // database has not been migrated for this request type yet (see
  // supabase/migrations) or a field is outside the allowed limits.
  if (insertError?.code === '23514' || insertError?.code === '23502') {
    return `We couldn't save this request right now. Please message us on WhatsApp or call ${CONTACT.phoneDisplay} and we'll help you directly.`
  }
  return insertError?.message || 'Something went wrong. Please try again.'
}

/**
 * Shared state and submit logic for the inquiry forms on the home page and
 * the /inquire page, so both save requests the same way.
 *
 * @param {object} options
 * @param {string|null} [options.initialDegree] degree from the URL, if any
 * @param {string} [options.urlProjectId] project id from the URL, if any
 * @param {boolean} [options.withProjects] load the catalog for the project picker
 */
export function useInquiryForm({
  initialDegree = null,
  urlProjectId = '',
  withProjects = false,
} = {}) {
  const { user, profile } = useAuth()

  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    degree: STUDENT_DEGREE_OPTIONS.includes(initialDegree) ? initialDegree : 'btech',
    message: '',
    website: '', // honeypot: hidden from people, filled in by bots
  }))
  const startedAt = useRef(0)
  // null = the visitor has not picked anything yet, so fall back to the
  // project in the URL (if it exists) or "own topic".
  const [projectChoice, setProjectChoice] = useState(null)
  const [prefilledFor, setPrefilledFor] = useState(null)
  const [loading, setLoading] = useState(withProjects && isSupabaseConfigured)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(
    isSupabaseConfigured ? '' : 'Supabase configuration is missing.',
  )
  const [success, setSuccess] = useState(false)

  // Prefill name/email/degree once per signed-in profile. Adjusting state
  // during render (instead of in an effect) avoids an extra render pass.
  const prefillKey = user ? `${user.id}:${profile?.id ?? ''}` : null
  if (prefillKey && prefillKey !== prefilledFor) {
    setPrefilledFor(prefillKey)
    setForm((current) => ({
      ...current,
      name: profile?.full_name || current.name,
      email: user.email || current.email,
      degree: profile?.degree || current.degree,
    }))
  }

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  useEffect(() => {
    if (!withProjects || !isSupabaseConfigured || !supabase) {
      return undefined
    }

    let alive = true
    const loadProjects = async () => {
      const { data, error: queryError } = await supabase
        .from('projects')
        .select('id,title')
        .eq('is_active', true)
        .order('title')
      if (!alive) {
        return
      }
      if (queryError) {
        setError(queryError.message)
      } else {
        setProjects(data ?? [])
      }
      setLoading(false)
    }
    loadProjects()
    return () => {
      alive = false
    }
  }, [withProjects])

  const urlProjectExists = projects.some((project) => project.id === urlProjectId)
  const projectId = projectChoice ?? (urlProjectExists ? urlProjectId : OWN_TOPIC)

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const setDegree = (degree) => setForm((current) => ({ ...current, degree }))

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setError('Supabase configuration is missing.')
      return
    }
    setError('')
    setSuccess(false)

    const looksLikeBot =
      form.website.trim() !== '' || Date.now() - startedAt.current < MIN_FILL_TIME_MS
    if (looksLikeBot) {
      setSuccess(true)
      return
    }

    setSubmitting(true)

    try {
      const { error: insertError } = await supabase.from('inquiries').insert({
        student_id: user?.id ?? null,
        project_id: projectId || null,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        degree: form.degree,
        message: form.message.trim(),
        status: 'pending',
      })

      if (insertError) {
        setError(friendlyInsertError(insertError))
        return
      }

      trackLead({
        degree: form.degree,
        request_type: projectId ? 'catalog_project' : 'own_topic',
      })
      setSuccess(true)
      setForm((current) => ({
        ...current,
        message: '',
      }))
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
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
  }
}
