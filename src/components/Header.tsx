import { Link, NavLink } from 'react-router-dom'
import { site } from '../site.config'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          PANCO<span>_</span>IT
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {site.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
          {import.meta.env.DEV && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav__admin${isActive ? ' active' : ''}`}
              title="localhost 전용 관리자 (프로덕션 미포함)"
            >
              관리자
            </NavLink>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
