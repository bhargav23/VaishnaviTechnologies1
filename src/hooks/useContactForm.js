import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth.js'
import { trackLead } from '../lib/analytics.js'
import { friendlyInsertError, looksLikeBot } from '../lib/formGuards.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '', // honeypot: hidden from people, filled in by bots
}

/**
 * State and submit logic for the Contact page form. Messages are saved to
 * the inquiries table with source 'contact', so they show up in
 * Admin → Inquiries alongside mentorship requests.
 */
export function useContactForm() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [prefilledFor, setPrefilledFor] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const startedAt = useRef(0)

  const prefillKey = user ? `${user.id}:${profile?.id ?? ''}` : null
  if (prefillKey && prefillKey !== prefilledFor) {
    setPrefilledFor(prefillKey)
    setForm((current) => ({
      ...current,
      name: profile?.full_name || current.name,
      email: user.email || current.email,
    }))
  }

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(false)

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase configuration is missing.')
      return
    }

    if (looksLikeBot(form.website, startedAt.current)) {
      setSuccess(true)
      return
    }

    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('inquiries').insert({
        student_id: user?.id ?? null,
        source: 'contact',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim(),
        status: 'pending',
      })
      if (insertError) {
        setError(friendlyInsertError(insertError))
        return
      }
      trackLead({ request_type: 'contact_form' })
      setSuccess(true)
      setForm((current) => ({ ...current, subject: '', message: '' }))
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return { form, updateField, submitting, error, success, onSubmit }
}
