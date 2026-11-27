import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth.js'
import { trackLead } from '../lib/analytics.js'
import { STUDENT_DEGREE_OPTIONS } from '../lib/constants.js'
import { friendlyInsertError, looksLikeBot } from '../lib/formGuards.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

// Value of the "not in the catalog" choice in the project dropdown. It is
// stored as a NULL project_id.
export const OWN_TOPIC = ''

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
    heardFrom: '',
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

    if (looksLikeBot(form.website, startedAt.current)) {
      setSuccess(true)
      return
    }

    setSubmitting(true)

    try {
      const inquiry = {
        student_id: user?.id ?? null,
        project_id: projectId || null,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        degree: form.degree,
        message: form.message.trim(),
        status: 'pending',
      }
      if (form.heardFrom) {
        inquiry.heard_from = form.heardFrom
      }
      let { error: insertError } = await supabase.from('inquiries').insert(inquiry)
      // PGRST204: the database doesn't have the heard_from column yet (see
      // supabase/migrations/20261127_inquiry_heard_from.sql). Save the
      // inquiry without it rather than losing the lead.
      if (insertError?.code === 'PGRST204' && 'heard_from' in inquiry) {
        delete inquiry.heard_from
        ;({ error: insertError } = await supabase.from('inquiries').insert(inquiry))
      }

      if (insertError) {
        setError(friendlyInsertError(insertError))
        return
      }

      trackLead({
        degree: form.degree,
        request_type: projectId ? 'catalog_project' : 'own_topic',
        heard_from: form.heardFrom || 'not_given',
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
