// Runs after `vite build`. Writes a copy of dist/index.html for each public
// page with that page's title, description and canonical URL, so link
// previews (WhatsApp, Facebook, LinkedIn) and crawlers that don't run
// JavaScript see the right details. netlify.toml serves these files for
// /catalog, /inquire and /contact. Project pages are handled by the
// project-preview function instead.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { PAGE_META, SITE_URL, fullTitle } from '../src/lib/pageMeta.js'

const DIST = new URL('../dist/', import.meta.url)
const OUT_DIR = new URL('route-pages/', DIST)
const PAGES = ['catalog', 'inquire', 'contact']

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function replaceMeta(html, selector, content) {
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*("\\s*\\/?>)`, 'i')
  if (!pattern.test(html)) {
    throw new Error(`index.html is missing <meta ${selector}>`)
  }
  return html.replace(pattern, (_match, prefix, suffix) => `${prefix}${escapeHtml(content)}${suffix}`)
}

const template = await readFile(new URL('index.html', DIST), 'utf8')
await mkdir(OUT_DIR, { recursive: true })

for (const key of PAGES) {
  const { path, title, description } = PAGE_META[key]
  const pageTitle = fullTitle(title)
  const url = `${SITE_URL}${path}`
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`)
  html = replaceMeta(html, 'name="description"', description)
  html = replaceMeta(html, 'property="og:title"', pageTitle)
  html = replaceMeta(html, 'property="og:description"', description)
  html = replaceMeta(html, 'property="og:url"', url)
  html = replaceMeta(html, 'name="twitter:title"', pageTitle)
  html = replaceMeta(html, 'name="twitter:description"', description)
  html = html.replace('</head>', `  <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`)
  await writeFile(new URL(`${key}.html`, OUT_DIR), html)
  console.log(`route-pages: ${path} -> dist/route-pages/${key}.html`)
}
