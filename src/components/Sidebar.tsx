import { Link, useLocation } from 'react-router-dom'
import { site } from '../site.config'
import { livePosts, postCountByCategory } from '../lib/posts'

/**
 * 왼쪽 카테고리 사이드바 (블로그형).
 * 2026 트렌드 반영: 헤어라인 보더, radius 최소, 활성 항목 좌측 액센트 바.
 * 데스크톱은 sticky 좌측 컬럼, 모바일은 가로 스크롤 칩으로 폴백(CSS).
 */
export default function Sidebar() {
  const { pathname } = useLocation()
  const decoded = decodeURIComponent(pathname)
  const allActive = decoded === '/posts' || decoded === '/'

  return (
    <aside className="sidebar">
      <nav className="cat-nav" aria-label="카테고리">
        <div className="sidebar__title">카테고리</div>

        <Link to="/posts" className={`cat-nav__item ${allActive ? 'active' : ''}`}>
          <span>전체 글</span>
          <span className="count">{livePosts.length}</span>
        </Link>

        {/* 공개 글이 있는 카테고리만 노출(빈 카테고리는 자동 숨김 → thin-page 방지) */}
        {site.categories
          .filter((c) => postCountByCategory(c.label) > 0)
          .map((c) => {
            const to = `/category/${encodeURIComponent(c.label)}`
            const active = decoded === `/category/${c.label}`
            const count = postCountByCategory(c.label)
            return (
            <Link
              key={c.label}
              to={to}
              className={`cat-nav__item ${active ? 'active' : ''}`}
              title={c.desc}
            >
              <span>{c.label}</span>
              <span className="count">{count}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
