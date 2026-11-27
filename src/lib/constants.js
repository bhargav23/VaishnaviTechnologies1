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

// "How did you hear about us?" on the inquiry form. The value is stored in
// inquiries.heard_from; labels can change, values should not (old inquiries
// keep their value). Shown as a summary on the admin inquiries page.
export const HEARD_FROM_OPTIONS = [
  ['google_search', 'Google search'],
  ['google_maps', 'Google Maps'],
  ['instagram', 'Instagram'],
  ['youtube', 'YouTube'],
  ['whatsapp', 'WhatsApp'],
  ['friend', 'Friend or senior'],
  ['college', 'College or workshop'],
  ['other', 'Other'],
]

export function heardFromLabel(value) {
  return HEARD_FROM_OPTIONS.find(([key]) => key === value)?.[1] ?? value
}

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

// Business details shown in the header, footer, contact page and home page.
export const BUSINESS = {
  addressLine1: 'Cheediga, Kakinada,',
  addressLine2: 'Andhra Pradesh — 533006',
  hoursShort: 'Mon–Sat, 10 AM – 7 PM IST',
  hoursLong: 'Monday to Saturday, 10 AM – 7 PM IST',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=16.9635634%2C82.206259',
}

// What a catalog project includes and what it costs, by degree. Shown on
// each project page; keep in step with the pricing section on the home page.
export const PROJECT_PACKAGES = {
  btech: {
    included: [
      'Working source code you can run and explain',
      'Project report for your submission',
      'PPT for your project reviews',
      'Viva preparation',
    ],
    price: '₹1,500 – ₹8,000',
    priceNote:
      'Mini projects from ₹1,500, major projects ₹4,000 – ₹8,000. Your quote depends on scope.',
    suitedFor: (domain) =>
      `B.Tech CSE / IT students who want a documented ${domain} project they can explain and defend in reviews and viva.`,
  },
  mtech: {
    included: [
      'Research-oriented implementation you can explain',
      'Thesis documentation and PPT',
      'Research paper mentoring',
      'Similarity check',
      'Viva preparation',
    ],
    price: '₹10,000 – ₹30,000+',
    priceNote: 'Thesis-level projects. Your quote depends on scope.',
    suitedFor: (domain) =>
      `M.Tech students who need a thesis-level ${domain} project with research and paper support.`,
  },
}
