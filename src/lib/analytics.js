// Google Analytics 4 / Google Ads tracking.
//
// Nothing loads unless at least one ID is set in the environment, so the site
// works the same with no configuration. Set these in Netlify's environment
// variables (see .env.example):
//   VITE_GA_MEASUREMENT_ID         GA4 measurement ID, e.g. G-XXXXXXXXXX
//   VITE_GOOGLE_ADS_ID             Google Ads tag ID, e.g. AW-123456789
//   VITE_GOOGLE_ADS_LEAD_LABEL     Conversion label for inquiry submissions
//   VITE_GOOGLE_ADS_CONTACT_LABEL  Conversion label for WhatsApp/phone/email clicks

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID
const ADS_LEAD_LABEL = import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL
const ADS_CONTACT_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONTACT_LABEL

let initialized = false

export function initAnalytics() {
  const ids = [GA_ID, ADS_ID].filter(Boolean)
  if (initialized || !ids.length || typeof window === 'undefined') {
    return
  }
  initialized = true

  window.dataLayer = window.dataLayer || []
  // gtag.js expects the `arguments` object itself, not an array.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  ids.forEach((id) => window.gtag('config', id))

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`
  document.head.appendChild(script)
}

function sendEvent(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

function sendAdsConversion(label) {
  if (ADS_ID && label) {
    sendEvent('conversion', { send_to: `${ADS_ID}/${label}` })
  }
}

/** A mentorship inquiry was saved successfully. */
export function trackLead(params = {}) {
  sendEvent('generate_lead', params)
  sendAdsConversion(ADS_LEAD_LABEL)
}

/** A visitor tapped a WhatsApp, phone, or email contact link. */
export function trackContactClick(method) {
  sendEvent('contact_click', { method })
  sendAdsConversion(ADS_CONTACT_LABEL)
}
