import { createContext } from 'react'
import { site } from '../site.config'

/** 해석된 head 메타데이터 */
export interface HeadData {
  fullTitle: string
  description: string
  url: string
  type: 'website' | 'article'
  image: string
  publishedTime?: string
  modifiedTime?: string
  jsonLd: Record<string, unknown>
  noindex: boolean
}

export interface SeoProps {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  image?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  article?: boolean
  /** 검색 색인 제외 (준비 중 글 등) */
  noindex?: boolean
}

/** SSR 렌더 중 head 를 수집하는 컨테이너 (client 에서는 null) */
export const HeadCollectorContext = createContext<{ current: HeadData | null } | null>(null)

/** Seo props → 해석된 HeadData */
export function computeMeta(props: SeoProps): HeadData {
  const { title, description = site.description, path = '/', type = 'website', image } = props
  const fullTitle = title ? `${title} — ${site.title}` : `${site.title} — IT 지식 정리 블로그`
  const url = `${site.siteUrl}${path}`
  const ogImage = image ? `${site.siteUrl}${image}` : `${site.siteUrl}/og-default.png`

  const jsonLd = props.article
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        image: ogImage,
        author: { '@type': 'Person', name: site.author.name },
        publisher: { '@type': 'Organization', name: site.title },
        datePublished: props.publishedTime,
        dateModified: props.modifiedTime ?? props.publishedTime,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: props.tags?.join(', '),
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.title,
        url: site.siteUrl,
        description: site.description,
      }

  return {
    fullTitle,
    description,
    url,
    type,
    image: ogImage,
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime,
    jsonLd,
    noindex: !!props.noindex,
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 애드센스 로더 스크립트를 넣어야 하는지.
 *  - client 가 실제 값(placeholder 아님)이고, review(심사) 또는 enabled(운영)일 때 true.
 */
export function adsenseActive(): boolean {
  const c = site.adsense.client
  return !!c && !c.includes('XXXX') && (site.adsense.review || site.adsense.enabled)
}

/** 사이트 전역(페이지 불변) head 태그: 소유 확인 메타 + 애드센스 로더 */
function siteGlobalTags(): string[] {
  return [
    site.verification.google
      ? `<meta name="google-site-verification" content="${escapeHtml(site.verification.google)}" />`
      : '',
    site.verification.naver
      ? `<meta name="naver-site-verification" content="${escapeHtml(site.verification.naver)}" />`
      : '',
    adsenseActive()
      ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsense.client}" crossorigin="anonymous"></script>`
      : '',
  ]
}

/** 프리렌더 시 <head> 에 삽입할 태그 문자열 생성 */
export function buildHeadHtml(d: HeadData): string {
  const m = (prop: string, content: string | undefined, attr: 'name' | 'property' = 'name') =>
    content ? `<meta ${attr}="${prop}" content="${escapeHtml(content)}" />` : ''
  const tags = [
    ...siteGlobalTags(),
    `<title>${escapeHtml(d.fullTitle)}</title>`,
    m('description', d.description),
    d.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '',
    `<link rel="canonical" href="${escapeHtml(d.url)}" />`,
    m('og:type', d.type, 'property'),
    m('og:site_name', site.title, 'property'),
    m('og:title', d.fullTitle, 'property'),
    m('og:description', d.description, 'property'),
    m('og:url', d.url, 'property'),
    m('og:image', d.image, 'property'),
    m('og:locale', site.locale, 'property'),
    m('article:published_time', d.publishedTime, 'property'),
    m('article:modified_time', d.modifiedTime, 'property'),
    m('twitter:card', 'summary_large_image'),
    m('twitter:title', d.fullTitle),
    m('twitter:description', d.description),
    m('twitter:image', d.image),
    `<script type="application/ld+json">${JSON.stringify(d.jsonLd)}</script>`,
  ]
  return tags.filter(Boolean).join('\n    ')
}

/** 클라이언트 SPA 내비게이션 시 document head 갱신 */
export function applyHead(d: HeadData): void {
  if (typeof document === 'undefined') return
  document.title = d.fullTitle

  const setMeta = (key: string, val: string, attr: 'name' | 'property' = 'name') => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.setAttribute('content', val)
  }

  setMeta('description', d.description)
  setMeta('robots', d.noindex ? 'noindex, nofollow' : 'index, follow')
  setMeta('og:type', d.type, 'property')
  setMeta('og:title', d.fullTitle, 'property')
  setMeta('og:description', d.description, 'property')
  setMeta('og:url', d.url, 'property')
  setMeta('og:image', d.image, 'property')
  setMeta('twitter:title', d.fullTitle)
  setMeta('twitter:description', d.description)

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = d.url

  let ld = document.getElementById('ld-json')
  if (!ld) {
    ld = document.createElement('script')
    ld.id = 'ld-json'
    ;(ld as HTMLScriptElement).type = 'application/ld+json'
    document.head.appendChild(ld)
  }
  ld.textContent = JSON.stringify(d.jsonLd)
}
