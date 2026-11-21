// Degree levels used by the project catalog.
export const DEGREE_OPTIONS = ['btech', 'mtech']

// Degree levels a student or scholar can pick when signing up or inquiring.
export const STUDENT_DEGREE_OPTIONS = ['btech', 'mtech', 'phd']

export const DEGREE_LABELS = {
  btech: 'B.Tech',
  mtech: 'M.Tech',
  phd: 'PhD',
}

export function degreeLabel(degree) {
  return DEGREE_LABELS[degree] ?? String(degree ?? '').toUpperCase()
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value) {
  return UUID_PATTERN.test(String(value ?? ''))
}

export const INQUIRY_STATUS = ['pending', 'active', 'completed']

export const CONTACT = {
  email: 'info@vaishnavitech.in',
  phoneDisplay: '+91 99895 72748',
  phoneHref: 'tel:+919989572748',
  whatsappNumber: '919989572748',
}

export function whatsappUrl(
  message = "Hi Vaishnavi Technologies, I'd like to know more about your project mentorship.",
) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
}
