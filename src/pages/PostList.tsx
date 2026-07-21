import { useMemo, useState } from 'react'
import Seo from '../components/Seo'
import Sidebar from '../components/Sidebar'
import PostRow from '../components/PostRow'
import { posts } from '../lib/posts'

export default function PostList() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        (p.category ?? '').toLowerCase().includes(q),
    )
  }, [query])

  return (
    <>
      <Seo title="전체 글" path="/posts" description="INFO IT 블로그의 모든 IT 지식 글 목록" />

      <div className="blog">
        <Sidebar />

        <div className="blog__main">
          <header className="feed-head">
            <p className="feed-head__eyebrow">모든 글을 한곳에</p>
            <h1>전체 글</h1>
            <p className="feed-head__desc">총 {posts.length}개의 글이 있어요.</p>
          </header>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·태그·카테고리 검색…"
            aria-label="글 검색"
            className="search-input"
          />

          {filtered.length === 0 ? (
            <p className="muted">검색 결과가 없습니다.</p>
          ) : (
            <div className="post-list">
              {filtered.map((p) => (
                <PostRow key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
