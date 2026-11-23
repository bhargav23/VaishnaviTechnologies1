import { CONTACT } from './constants.js'

// Bots that fill every field, or submit within a moment of the page
// loading, are treated as spam: they see the normal success message, but
// nothing is saved. The database has its own limits as well (see
// supabase/migrations/20261123_inquiry_phone_and_spam_guard.sql).
export const MIN_FILL_TIME_MS = 3000

export function looksLikeBot(honeypotValue, startedAt) {
  return (
    String(honeypotValue ?? '').trim() !== '' ||
    Date.now() - startedAt < MIN_FILL_TIME_MS
  )
}

/** Turns a Supabase insert error into a message a visitor can act on. */
export function friendlyInsertError(insertError) {
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
