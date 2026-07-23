import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { site } from '../site.config'
import { livePosts, postCountByCategory } from '../lib/posts'

type Cat = (typeof site.categories)[number]

type VisitorStats = { daily: number | null; total: number | null }

/**
 * 방문 통계(GA4)를 정적 파일 `/stats.json` 에서 가져온다.
 * GitHub Actions 크론이 GA4 Data API 로 갱신 → 사이트는 숫자만 읽어 표시.
 * 파일이 없거나 값이 비면 아무것도 렌더링하지 않아 디자인에 영향 없음.
 */
function useVisitorStats(): VisitorStats | null {
  const [stats, setStats] = useState<VisitorStats | null>(null)
  useEffect(() => {
    let alive = true
    fetch(`${import.meta.env.BASE_URL}stats.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && (typeof d.daily === 'number' || typeof d.total === 'number')) {
          setStats({ daily: d.daily ?? null, total: d.total ?? null })
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return stats
}

/**
 * 왼쪽 카테고리 사이드바 (블로그형, 그룹→세부토픽 계층).
 *  - 맨 위 "전체 글" + 가로선(divider)
 *  - group 이 없는 카테고리는 평면으로, 같은 group 은 헤더 아래로 묶어 표시
 *  - 공개 글이 있는 카테고리만 노출(빈 카테고리 숨김 → thin-page 방지)
 * 데스크톱은 sticky 좌측 컬럼, 모바일은 가로 스크롤 칩으로 폴백(CSS).
 */
export default function Sidebar() {
  const { pathname } = useLocation()
  const decoded = decodeURIComponent(pathname)
  const allActive = decoded === '/posts' || decoded === '/'
  const stats = useVisitorStats()

  // 관리자(localhost·dev)에선 구조 확인용으로 모든 카테고리를 노출한다.
  // 실제 사이트(프로덕션)에선 글이 있는 카테고리만 노출(빈 카테고리 숨김 → thin-page 방지).
  const visible = site.categories.filter((c) => import.meta.env.DEV || postCountByCategory(c.label) > 0)

  // 배열 순서 그대로: group 없는 카테고리는 평면 항목, 같은 group 은 첫 등장 위치에 묶어
  // 하나의 순서 리스트(blocks)로 만든다 → 관리자에서 정렬한 순서가 그대로 반영된다.
  type Block = { type: 'item'; cat: Cat } | { type: 'group'; name: string; items: Cat[] }
  const blocks: Block[] = []
  for (const c of visible) {
    if (!c.group) {
      blocks.push({ type: 'item', cat: c })
      continue
    }
    let g = blocks.find((b): b is Extract<Block, { type: 'group' }> => b.type === 'group' && b.name === c.group)
    if (!g) {
      g = { type: 'group', name: c.group, items: [] }
      blocks.push(g)
    }
    g.items.push(c)
  }

  const item = (c: Cat) => {
    const active = decoded === `/category/${c.label}`
    return (
      <Link
        key={c.label}
        to={`/category/${encodeURIComponent(c.label)}`}
        className={`cat-nav__item ${active ? 'active' : ''}`}
        title={c.desc}
      >
        <span>{c.label}</span>
        <span className="count">{postCountByCategory(c.label)}</span>
      </Link>
    )
  }

  return (
    <aside className="sidebar">
      <nav className="cat-nav" aria-label="카테고리">
        {stats && (
          <Link to="/stats" className="sidebar-stats" title="방문 통계 자세히 보기">
            <span className="sidebar-stats__row">
              오늘 <b>{(stats.daily ?? 0).toLocaleString('ko-KR')}</b>
              <span className="sidebar-stats__sep">·</span>
              누적 <b>{(stats.total ?? 0).toLocaleString('ko-KR')}</b>
            </span>
          </Link>
        )}
        <div className="sidebar__title">카테고리</div>

        <Link to="/posts" className={`cat-nav__item ${allActive ? 'active' : ''}`}>
          <span>전체 글</span>
          <span className="count">{livePosts.length}</span>
        </Link>

        {blocks.length > 0 && (
          <div className="cat-divider" role="separator" aria-hidden="true" />
        )}

        {blocks.map((b) =>
          b.type === 'item' ? (
            item(b.cat)
          ) : (
            <div className="cat-group" key={`group-${b.name}`}>
              <div className="cat-group__title">{b.name}</div>
              {b.items.map(item)}
            </div>
          ),
        )}
      </nav>
    </aside>
  )
}
