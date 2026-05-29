// Server-side YouTube search scraper. Resolves a real videoId for a search query
// by fetching YouTube's results page and extracting the first videoId from the HTML.
// No API key required. Returns undefined on any failure (caller falls back to a search link).

const VIDEO_ID_RE = /"videoId":"([a-zA-Z0-9_-]{11})"/

const videoIdCache = new Map<string, string | undefined>()

export async function resolveVideoId(query: string): Promise<string | undefined> {
  const q = (query || '').trim()
  if (!q) return undefined

  const cached = videoIdCache.get(q)
  if (cached !== undefined || videoIdCache.has(q)) return cached

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=en`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        // A desktop UA reduces the chance of getting the consent/cookie wall.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      // Avoid Next.js caching this scrape between requests
      cache: 'no-store',
    })
    clearTimeout(timeout)
    if (!res.ok) {
      videoIdCache.set(q, undefined)
      return undefined
    }
    const html = await res.text()
    const match = html.match(VIDEO_ID_RE)
    const resolved = match ? match[1] : undefined
    videoIdCache.set(q, resolved)
    return resolved
  } catch {
    videoIdCache.set(q, undefined)
    return undefined
  }
}

// Resolve many queries in parallel. Returns an array aligned to the input order,
// each element a videoId string or undefined.
export async function resolveVideoIds(queries: string[]): Promise<(string | undefined)[]> {
  return Promise.all(queries.map((q) => resolveVideoId(q)))
}
