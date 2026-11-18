const staticPaths = [
  ['', 'weekly', '1.0'],
  ['/catalog', 'daily', '0.9'],
  ['/inquire', 'monthly', '0.6'],
  ['/contact', 'monthly', '0.5'],
]

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export default async (request) => {
  const origin = new URL(request.url).origin
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return new Response('Supabase environment variables are not configured.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const projectsUrl = new URL('/rest/v1/projects', supabaseUrl)
  projectsUrl.searchParams.set('select', 'id')
  projectsUrl.searchParams.set('is_active', 'eq.true')

  const response = await fetch(projectsUrl, {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
  })
  if (!response.ok) {
    return new Response('Unable to generate the project sitemap.', {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const projectIds = (await response.json()).map((project) => project.id)

  const urls = [
    ...staticPaths.map(
      ([path, changefreq, priority]) =>
        `  <url>\n    <loc>${xmlEscape(new URL(path, origin).href)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    ),
    ...projectIds.map(
      (id) =>
        `  <url>\n    <loc>${xmlEscape(new URL(`/project/${encodeURIComponent(id)}`, origin).href)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ),
  ]

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    },
  )
}
