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
    `${project.degree_level.toUpperCase()} ${project.domain} academic project with mentorship from Vaishnavi Technologies.`

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

  const htmlResponse = await fetch(new URL('/index.html', requestUrl.origin))
  if (!htmlResponse.ok) {
    return new Response('Unable to load the application page.', { status: 502 })
  }

  let html = await htmlResponse.text()
  if (!projectId) {
    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  const projectsUrl = new URL('/rest/v1/projects', supabaseUrl)
  projectsUrl.searchParams.set('select', 'title,degree_level,domain,abstract')
  projectsUrl.searchParams.set('id', `eq.${projectId}`)
  projectsUrl.searchParams.set('is_active', 'eq.true')

  const projectResponse = await fetch(projectsUrl, {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
  })
  if (!projectResponse.ok) {
    return new Response('Unable to load project metadata.', { status: 502 })
  }

  const [project] = await projectResponse.json()
  if (!project) {
    return new Response(html, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  html = updateProjectMetadata(
    html,
    project,
    new URL(`/project/${encodeURIComponent(projectId)}`, requestUrl.origin).href,
  )

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  })
}
