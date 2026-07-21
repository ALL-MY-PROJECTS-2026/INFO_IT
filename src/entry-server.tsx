import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import { HeadCollectorContext, buildHeadHtml, type HeadData } from './lib/head'
import { posts, getCategories } from './lib/posts'

export interface RenderResult {
  html: string
  head: string
}

// GitHub Pages 하위 경로(/INFO_IT/) 대응
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

/** 단일 URL 을 정적 HTML 로 렌더 (Node 24 안전: renderToString + Context 수집) */
export function render(url: string): RenderResult {
  const collector: { current: HeadData | null } = { current: null }
  // basename 이 있으면 브라우저가 보는 전체 경로(basename + url)로 렌더
  const location = basename === '/' ? url : `${basename}${url}`
  const html = renderToString(
    <HeadCollectorContext.Provider value={collector}>
      <StaticRouter basename={basename} location={location}>
        <App />
      </StaticRouter>
    </HeadCollectorContext.Provider>,
  )
  const head = collector.current ? buildHeadHtml(collector.current) : ''
  return { html, head }
}

/** 프리렌더 대상 전체 경로 목록 (정적 페이지 + 글 + 카테고리) */
export function getPrerenderPaths(): string[] {
  const staticPaths = ['/', '/posts', '/about', '/contact', '/privacy', '/terms']
  const postPaths = posts.map((p) => `/posts/${p.slug}`)
  const categoryPaths = getCategories().map(
    (c) => `/category/${encodeURIComponent(c.name)}`,
  )
  return [...staticPaths, ...postPaths, ...categoryPaths]
}
