import { Link } from 'react-router-dom'
import { site } from '../site.config'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container">
        <strong>{site.title}</strong>
        <p className="muted" style={{ marginTop: '0.4rem', maxWidth: '48ch' }}>
          {site.description}
        </p>
        <nav className="site-footer__links" aria-label="푸터 메뉴">
          <Link to="/about">소개</Link>
          <Link to="/contact">문의</Link>
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/terms">이용약관</Link>
        </nav>
        <p className="muted" style={{ marginTop: '1.25rem', fontSize: '0.82rem' }}>
          © {year} {site.title}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
