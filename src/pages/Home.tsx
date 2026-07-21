import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Sidebar from '../components/Sidebar'
import PostRow from '../components/PostRow'
import AdUnit from '../components/ads/AdUnit'
import { livePosts } from '../lib/posts'
import { formatDate } from '../lib/format'
import { site } from '../site.config'

export default function Home() {
  const [featured, ...rest] = livePosts

  return (
    <>
      <Seo path="/" />

      <div className="blog">
        <Sidebar />

        <div className="blog__main">
          {/* 히어로리스: 타이포 중심 헤더 */}
          <header className="feed-head">
            <p className="feed-head__eyebrow">쉽고 친근하게 배우는 IT</p>
            <h1>{site.title}</h1>
            <p className="feed-head__desc">{site.description}</p>
          </header>

          {livePosts.length === 0 ? (
            <p className="muted" style={{ paddingTop: '2rem' }}>
              아직 작성된 글이 없습니다. 왼쪽 카테고리부터 하나씩 채워보세요.
            </p>
          ) : (
            <>
              {featured && (
                <Link to={`/posts/${featured.slug}`} className="feature">
                  <span className="feature__label">추천</span>
                  <h2 className="feature__title">{featured.title}</h2>
                  <p className="feature__excerpt">{featured.description}</p>
                  <div className="post-row__meta">
                    {featured.category && <span className="post-row__cat">{featured.category}</span>}
                    <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  </div>
                </Link>
              )}

              <div className="feed-bar">
                <h2>최신 글</h2>
                <Link to="/posts" className="feed-bar__all">
                  전체 글 →
                </Link>
              </div>

              {rest.length > 0 && (
                <div className="post-list">
                  {rest.map((p) => (
                    <PostRow key={p.slug} post={p} />
                  ))}
                </div>
              )}
            </>
          )}

          <AdUnit slot="home-bottom" />
        </div>
      </div>
    </>
  )
}
