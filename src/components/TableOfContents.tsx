import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

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

  if (headings.length < 2) return null

  return (
    <nav className="toc" aria-label="목차">
      <div className="toc__title">목차</div>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`${h.level === 3 ? 'lvl-3' : ''} ${activeId === h.id ? 'active' : ''}`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}
