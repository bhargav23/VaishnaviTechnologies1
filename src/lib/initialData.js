import { createContext, useContext } from 'react'

// Data that scripts/route-pages.mjs bakes into a prerendered page (today: the
// active catalog projects). Pages start from it, so search engines and the
// first paint see real content, then refresh it from Supabase as usual.
export const InitialDataContext = createContext({})

/** Reads one key of the build-time data, e.g. useInitialData('catalog'). */
export function useInitialData(key) {
  return useContext(InitialDataContext)[key]
}

/** Reads the build-time data that route-pages.mjs wrote into the page. */
export function readInitialData() {
  const element = document.getElementById('initial-data')
  if (!element) {
    return {}
  }
  try {
    return JSON.parse(element.textContent) ?? {}
  } catch {
    return {}
  }
}
