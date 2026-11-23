const DEGREE_LABELS = { btech: 'B.Tech', mtech: 'M.Tech', phd: 'PhD' }

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Netlify's [[headers]] rules cover static files; responses from this
// function set the same security headers themselves. Keep in sync with
// netlify.toml.
const SECURITY_HEADERS = {
  'content-security-policy':
    "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://www.google.co.in https://googleads.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://www.google.com https://maps.google.com https://www.googletagmanager.com https://td.doubleclick.net; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}

function htmlResponse(html, { status = 200, cacheControl = 'no-cache' } = {}) {
  return new Response(html, {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'content-type': 'text/html; charset=utf-8',
      'cache-control': cacheControl,
    },
  })
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function replaceMeta(html, selector, content) {
  const escapedContent = escapeHtml(content)
  const pattern = new RegExp(
    `(<meta\\s+${selector}\\s+content=")[^"]*("\\s*\\/?>)`,
    'i',
  )
  return html.replace(
    pattern,
    (_match, prefix, suffix) => `${prefix}${escapedContent}${suffix}`,
  )
}

function updateProjectMetadata(html, project, projectUrl) {
  const title = `${project.title} | Vaishnavi Technologies`
  const description =
    project.abstract ||
    `${DEGREE_LABELS[project.degree_level] ?? String(project.degree_level ?? '').toUpperCase()} ${project.domain} academic project with mentorship from Vaishnavi Technologies.`

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  html = replaceMeta(html, 'name="description"', description)
  html = replaceMeta(html, 'property="og:title"', title)
  html = replaceMeta(html, 'property="og:description"', description)
  html = replaceMeta(html, 'property="og:url"', projectUrl)
  html = replaceMeta(html, 'name="twitter:title"', title)
  html = replaceMeta(html, 'name="twitter:description"', description)
  html = html.replace(
    '</head>',
    `  <link rel="canonical" href="${escapeHtml(projectUrl)}" />\n  </head>`,
  )
  return html
}

export default async (request) => {
  const requestUrl = new URL(request.url)
  const projectId =
    requestUrl.searchParams.get('id') ??
    requestUrl.pathname.match(/^\/project\/([^/]+)$/)?.[1]
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return new Response('Supabase environment variables are not configured.', {
      status: 503,
    })
  }

  const appPage = await fetch(new URL('/index.html', requestUrl.origin))
  if (!appPage.ok) {
    return new Response('Unable to load the application page.', { status: 502 })
  }

  let html = await appPage.text()
  if (!projectId) {
    return htmlResponse(html)
  }

  // Anything that is not a UUID can never match a project. Answer with the
  // normal app page and a 404 so the browser shows "Project not found"
  // instead of a bare error (Supabase rejects malformed UUIDs with a 400).
  if (!UUID_PATTERN.test(projectId)) {
    return htmlResponse(html, { status: 404 })
  }

  const projectsUrl = new URL('/rest/v1/projects', supabaseUrl)
  projectsUrl.searchParams.set('select', 'title,degree_level,domain,abstract')
  projectsUrl.searchParams.set('id', `eq.${projectId}`)
  projectsUrl.searchParams.set('is_active', 'eq.true')

  let project
  try {
    const projectResponse = await fetch(projectsUrl, {
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${anonKey}`,
      },
    })
    if (!projectResponse.ok) {
      throw new Error(`Supabase responded with ${projectResponse.status}`)
    }
    ;[project] = await projectResponse.json()
  } catch {
    // Metadata is a nice-to-have: still serve the app so visitors see the
    // page, and tell crawlers to come back later.
    return htmlResponse(html, { status: 503 })
  }

  if (!project) {
    return htmlResponse(html, { status: 404 })
  }

  html = updateProjectMetadata(
    html,
    project,
    new URL(`/project/${encodeURIComponent(projectId)}`, requestUrl.origin).href,
  )

  return htmlResponse(html, { cacheControl: 'public, max-age=60' })
}
