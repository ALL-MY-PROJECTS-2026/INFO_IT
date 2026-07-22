import { Link, useLocation } from 'react-router-dom'
import { site } from '../site.config'
import { livePosts, postCountByCategory } from '../lib/posts'

type Cat = (typeof site.categories)[number]

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

  const visible = site.categories.filter((c) => postCountByCategory(c.label) > 0)
  const ungrouped = visible.filter((c) => !c.group)

  // group 이 있는 카테고리를 첫 등장 순서대로 묶기
  const groups: { name: string; items: Cat[] }[] = []
  for (const c of visible) {
    if (!c.group) continue
    let g = groups.find((x) => x.name === c.group)
    if (!g) {
      g = { name: c.group, items: [] }
      groups.push(g)
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
        <div className="sidebar__title">카테고리</div>

        <Link to="/posts" className={`cat-nav__item ${allActive ? 'active' : ''}`}>
          <span>전체 글</span>
          <span className="count">{livePosts.length}</span>
        </Link>

        {(ungrouped.length > 0 || groups.length > 0) && (
          <div className="cat-divider" role="separator" aria-hidden="true" />
        )}

        {ungrouped.map(item)}

        {groups.map((g) => (
          <div className="cat-group" key={g.name}>
            <div className="cat-group__title">{g.name}</div>
            {g.items.map(item)}
          </div>
        ))}
      </nav>
    </aside>
  )
}
