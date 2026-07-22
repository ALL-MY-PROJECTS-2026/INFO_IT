import { Link } from 'react-router-dom'

export interface Crumb {
  name: string
  path: string
}

/** 화면 브레드크럼 (홈 > 카테고리 > 글). BreadcrumbList 구조화데이터는 Seo 에서 별도 주입. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null
  return (
    <nav className="breadcrumbs" aria-label="현재 위치">
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.path + i}>
              {last ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link to={c.path}>{c.name}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
