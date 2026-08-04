import { useEffect } from 'react'

const SITE_NAME = 'Vaishnavi Technologies'
const SITE_URL = 'https://vaishnavitech.in'

function setMetaTag(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(path) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', `${SITE_URL}${path}`)
}

/**
 * Sets the document title, meta description, Open Graph tags, and
 * canonical URL for the current route. Call once per page component.
 *
 * @param {Object} options
 * @param {string} options.title - Page-specific title (site name is appended automatically)
 * @param {string} options.description - Page-specific meta description
 * @param {string} [options.path] - Route path for the canonical URL, e.g. '/catalog'
 * @param {boolean} [options.noindex] - Set true for private/functional pages (auth, dashboard, admin)
 */
export function useDocumentMeta({ title, description, path = '', noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    document.title = fullTitle

    if (description) {
      setMetaTag('name', 'description', description)
      setMetaTag('property', 'og:description', description)
      setMetaTag('name', 'twitter:description', description)
    }

    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('property', 'og:url', `${SITE_URL}${path}`)
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    setCanonical(path)
  }, [title, description, path, noindex])
}
