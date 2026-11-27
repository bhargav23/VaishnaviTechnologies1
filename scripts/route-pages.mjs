// Runs after `vite build` and the server build (see package.json). Writes a
// prerendered copy of dist/index.html for each public page, with:
//   - the page's title, description, link-preview tags and canonical URL, so
//     WhatsApp/Facebook/LinkedIn previews show the right details;
//   - the page content itself, so search engines and AI tools that don't run
//     JavaScript see the full page instead of an empty one;
//   - the active catalog projects as JSON, so the catalog and the B.Tech /
//     M.Tech pages list them in the HTML. The browser then loads the live
//     catalog as usual, so a project added later still shows up (and appears
//     in the HTML from the next deploy).
// netlify.toml serves these files for the public paths. dist/index.html
// itself stays an empty shell for the signed-in pages, 404s and project
// pages (which netlify/functions/project-preview.mjs fills in).
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
import { PAGE_META, PRERENDERED_PAGES, SITE_URL, fullTitle } from '../src/lib/pageMeta.js'

const DIST = new URL('../dist/', import.meta.url)
const OUT_DIR = new URL('route-pages/', DIST)
const SERVER_ENTRY = new URL('../dist-ssr/entry-server.js', import.meta.url)

const { render } = await import(SERVER_ENTRY)

// Pages whose content comes from the catalog.
const CATALOG_PAGES = new Set(['catalog', 'btech', 'mtech'])

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

// JSON inside <script> must not be able to close the tag.
function scriptJson(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll(' ', '\\u2028')
    .replaceAll(' ', '\\u2029')
}

function replaceMeta(html, selector, content) {
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*("\\s*\\/?>)`, 'i')
  if (!pattern.test(html)) {
    throw new Error(`index.html is missing <meta ${selector}>`)
  }
  return html.replace(pattern, (_match, prefix, suffix) => `${prefix}${escapeHtml(content)}${suffix}`)
}

// Same query and order as the catalog page. If Supabase can't be reached,
// the pages are still written, just without the project list in the HTML.
async function loadCatalog() {
  const env = loadEnv('production', process.cwd(), 'VITE_')
  const supabaseUrl = env.VITE_SUPABASE_URL
  const anonKey = env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    console.warn('route-pages: Supabase variables not set; pages will not list catalog projects.')
    return null
  }

  const url = new URL('/rest/v1/projects', supabaseUrl)
  url.searchParams.set('select', 'id,title,degree_level,domain,abstract,tags')
  url.searchParams.set('is_active', 'eq.true')
  url.searchParams.set('order', 'degree_level.asc,created_at.desc,title.asc')

  try {
    const response = await fetch(url, {
      headers: { apikey: anonKey, authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) {
      throw new Error(`Supabase responded with ${response.status}`)
    }
    const projects = await response.json()
    console.log(`route-pages: ${projects.length} catalog projects`)
    return projects
  } catch (error) {
    console.warn(`route-pages: could not load the catalog (${error.message}); pages will not list catalog projects.`)
    return null
  }
}

const template = await readFile(new URL('index.html', DIST), 'utf8')
const ROOT = '<div id="root"></div>'
if (!template.includes(ROOT)) {
  throw new Error(`index.html is missing ${ROOT}`)
}

const catalog = await loadCatalog()
await mkdir(OUT_DIR, { recursive: true })

for (const key of PRERENDERED_PAGES) {
  const { path, title, description } = PAGE_META[key]
  const pageTitle = fullTitle(title)
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
  const initialData = catalog && CATALOG_PAGES.has(key) ? { catalog } : {}

  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`)
  html = replaceMeta(html, 'name="description"', description)
  html = replaceMeta(html, 'property="og:title"', pageTitle)
  html = replaceMeta(html, 'property="og:description"', description)
  html = replaceMeta(html, 'property="og:url"', url)
  html = replaceMeta(html, 'name="twitter:title"', pageTitle)
  html = replaceMeta(html, 'name="twitter:description"', description)
  html = html.replace(
    '</head>',
    `  <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`,
  )

  const appHtml = render(path, initialData)
  const dataScript = Object.keys(initialData).length
    ? `<script id="initial-data" type="application/json">${scriptJson(initialData)}</script>\n    `
    : ''
  html = html.replace(
    ROOT,
    () => `${dataScript}<div id="root" data-prerendered-path="${escapeHtml(path)}">${appHtml}</div>`,
  )

  await writeFile(new URL(`${key}.html`, OUT_DIR), html)
  console.log(`route-pages: ${path} -> dist/route-pages/${key}.html (${Math.round(html.length / 1024)} kB)`)
}
