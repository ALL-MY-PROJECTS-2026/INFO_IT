import { Link } from 'react-router-dom'
import { site } from '../site.config'

export default function Footer() {
  const year = new Date().getFullYear()
  const f = site.footer

  return (
    <footer className="site-footer">
      <div className="container">
        <strong>{site.title}</strong>
        {f.tagline && (
          <p className="muted" style={{ marginTop: '0.4rem', maxWidth: '48ch' }}>
            {f.tagline}
          </p>
        )}
        <nav className="site-footer__links" aria-label="푸터 메뉴">
          {f.links.map((l) => (
            <Link key={`${l.to}-${l.label}`} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="muted" style={{ marginTop: '1.25rem', fontSize: '0.82rem' }}>
          {f.copyright.replace('{year}', String(year))}
        </p>
      </div>
    </footer>
  )
}
