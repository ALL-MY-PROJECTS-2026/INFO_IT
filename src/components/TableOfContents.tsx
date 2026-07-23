import { useEffect, useState, type MouseEvent } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

// 스티키 헤더 여백. CSS 의 scroll-padding-top: 5rem(=80px) 과 맞춘다.
const SCROLL_OFFSET = 80

/** 본문(article) 내 h2/h3 를 읽어 스티키 목차 생성 + 현재 섹션 하이라이트 */
export default function TableOfContents({ containerId }: { containerId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return
    const nodes = Array.from(container.querySelectorAll('h2, h3')) as HTMLElement[]
    const items: Heading[] = nodes
      .filter((n) => n.id)
      .map((n) => ({
        id: n.id,
        text: n.textContent ?? '',
        level: Number(n.tagName.substring(1)),
      }))
    setHeadings(items)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )
    nodes.forEach((n) => n.id && observer.observe(n))
    return () => observer.disconnect()
  }, [containerId])

  // 목차 클릭: 네이티브 프래그먼트 스크롤에 의존하지 않고 직접 스크롤한다.
  // (한글 id·SPA 이동 등 환경차와 무관하게 항상 동작하도록 window.scrollTo 사용)
  const handleClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id)
    if (!el) return // 대상이 없으면 기본 동작에 맡김
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
    window.scrollTo({ top: y, left: 0, behavior: reduce ? 'auto' : 'smooth' })
    // 주소창 해시만 갱신(스크롤은 위에서 처리) — 공유·뒤로가기용
    history.replaceState(null, '', `${location.pathname}${location.search}#${encodeURIComponent(id)}`)
    setActiveId(id)
  }

  if (headings.length < 2) return null

  return (
    <nav className="toc" aria-label="목차">
      <div className="toc__title">목차</div>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => handleClick(e, h.id)}
          className={`${h.level === 3 ? 'lvl-3' : ''} ${activeId === h.id ? 'active' : ''}`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}
