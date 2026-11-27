// Titles and descriptions for the public pages. Used by the pages at runtime
// (useDocumentMeta) and by scripts/route-pages.mjs at build time, which
// writes a copy of index.html for each page so link previews on WhatsApp,
// Facebook and LinkedIn show the right title. Keep this file free of browser
// and React imports: it also runs in Node.

export const SITE_NAME = 'Vaishnavi Technologies'
export const SITE_URL = 'https://vaishnavitech.in'

export function fullTitle(title) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME
}

export const PAGE_META = {
  home: {
    path: '/',
    title: 'B.Tech, M.Tech & PhD CSE Project Mentorship',
    description:
      'CSE project and research mentorship in Kakinada for B.Tech, M.Tech and PhD students: catalog, custom-built and guided projects with documentation, PPT and viva preparation. Transparent pricing.',
  },
  catalog: {
    path: '/catalog',
    title: 'Project Catalog',
    description:
      'Browse B.Tech and M.Tech CSE project options by degree, domain, and keyword — with code, documentation, and viva support included.',
  },
  inquire: {
    path: '/inquire',
    title: 'Request Mentorship',
    description:
      'Submit your B.Tech, M.Tech or PhD project or research requirement and get matched with the right mentorship track: catalog, custom-built, or guided support.',
  },
  contact: {
    path: '/contact',
    title: 'Contact Us',
    description:
      'Get in touch with Vaishnavi Technologies for questions about pricing, process, or general B.Tech, M.Tech and PhD project mentorship enquiries.',
  },
  // Landing pages for what students search for (see src/pages/LandingPage.jsx).
  btech: {
    path: '/btech-cse-projects',
    title: 'B.Tech CSE & IT Final Year Projects in Kakinada',
    description:
      'Mini and major B.Tech CSE and IT final year projects in Kakinada, with working source code, project report, PPT and viva preparation. From ₹1,500.',
  },
  mtech: {
    path: '/mtech-cse-projects',
    title: 'M.Tech CSE Projects & Thesis Guidance in Kakinada',
    description:
      'Thesis-level M.Tech CSE projects in Kakinada with research paper mentoring, similarity check, thesis documentation, PPT and viva preparation. From ₹10,000.',
  },
  phd: {
    path: '/phd-research-guidance',
    title: 'PhD Research Guidance for CSE Scholars in Kakinada',
    description:
      'Research guidance for computer science PhD scholars: problem selection, literature review, experiment design, paper mentoring, journal selection and thesis preparation.',
  },
}

// Landing pages, in display order (content in src/pages/LandingPage.jsx).
export const LANDING_PAGE_KEYS = ['btech', 'mtech', 'phd']

// Public pages that scripts/route-pages.mjs prerenders, in sitemap order.
// Each needs a rewrite in netlify.toml and an entry in the sitemap.
export const PRERENDERED_PAGES = ['home', 'catalog', 'btech', 'mtech', 'phd', 'inquire', 'contact']
