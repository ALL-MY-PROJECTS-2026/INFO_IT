// 관리자 저장 API 클라이언트 (localhost dev 미들웨어 호출).
const BASE = '/__admin/api'

async function req(method: string, path: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data && (data as { error?: string }).error) || res.statusText)
  return data
}

export interface PostItem {
  slug: string
  title: string
  category: string
  draft: boolean
}

export const adminApi = {
  getSite: () => req('GET', '/site') as Promise<Record<string, unknown>>,
  putSite: (obj: unknown) => req('PUT', '/site', obj),
  listPosts: () => req('GET', '/posts') as Promise<{ items: PostItem[] }>,
  getPost: (slug: string) => req('GET', `/posts/${slug}`) as Promise<{ slug: string; raw: string }>,
  putPost: (slug: string, raw: string) => req('PUT', `/posts/${slug}`, { raw }),
  delPost: (slug: string) => req('DELETE', `/posts/${slug}`),
  getPage: (slug: string) => req('GET', `/pages/${slug}`) as Promise<{ slug: string; raw: string }>,
  putPage: (slug: string, raw: string) => req('PUT', `/pages/${slug}`, { raw }),
  listMedia: () => req('GET', '/media') as Promise<{ items: string[] }>,
  uploadMedia: (filename: string, dataUrl: string) =>
    req('POST', '/media', { filename, dataUrl }) as Promise<{ path: string }>,
}
