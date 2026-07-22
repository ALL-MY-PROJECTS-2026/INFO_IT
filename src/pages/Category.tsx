import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Breadcrumbs from '../components/Breadcrumbs'
import Sidebar from '../components/Sidebar'
import PostRow from '../components/PostRow'
import { getPostsByCategory } from '../lib/posts'
import { site } from '../site.config'

export default function Category() {
  const { name } = useParams<{ name: string }>()
  const category = name ? decodeURIComponent(name) : ''
  const list = getPostsByCategory(category)
  const meta = site.categories.find((c) => c.label === category)

  const crumbs = [
    { name: '홈', path: '/' },
    { name: category, path: `/category/${encodeURIComponent(category)}` },
  ]

  return (
    <>
      <Seo
        title={`${category} 카테고리`}
        path={`/category/${encodeURIComponent(category)}`}
        breadcrumbs={crumbs}
      />

      <div className="blog">
        <Sidebar />

        <div className="blog__main">
          <Breadcrumbs items={crumbs} />
          <header className="feed-head">
            <p className="feed-head__eyebrow">카테고리</p>
            <h1>{category}</h1>
            <p className="feed-head__desc">
              {meta ? meta.desc : `${list.length}개의 글`}
            </p>
          </header>

          {list.length === 0 ? (
            <p className="muted" style={{ paddingTop: '1.5rem' }}>
              이 카테고리에는 아직 글이 없어요. <Link to="/posts">전체 글 보기</Link>
            </p>
          ) : (
            <div className="post-list">
              {list.map((p) => (
                <PostRow key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
