import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <div className="notfound">
      <Seo title="페이지를 찾을 수 없음" path="/404" />
      <h1>404</h1>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <Link to="/" className="btn">
          홈으로
        </Link>
        <Link to="/posts" className="btn btn--ghost">
          전체 글
        </Link>
      </div>
    </div>
  )
}
