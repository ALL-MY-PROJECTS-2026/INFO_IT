import { useMemo, useState } from 'react'
import Seo from '../components/Seo'
import Sidebar from '../components/Sidebar'
import PostRow from '../components/PostRow'
import { posts } from '../lib/posts'

type SortKey = 'new' | 'old' | 'cat'

export default function PostList() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('') // '' = 전체
  const [sort, setSort] = useState<SortKey>('new')

  // 글에 실제로 쓰인 카테고리 목록
  const categories = useMemo(() => {
    const s = new Set<string>()
    posts.forEach((p) => p.category && s.add(p.category))
    return [...s]
  }, [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = posts.filter((p) => {
      if (cat && p.category !== cat) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        (p.category ?? '').toLowerCase().includes(q)
      )
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'cat') {
        const c = (a.category ?? '').localeCompare(b.category ?? '', 'ko')
        if (c !== 0) return c
        return a.date < b.date ? 1 : -1 // 같은 카테고리 안에서는 최신순
      }
      if (sort === 'old') return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0 // new (최신순)
    })
  }, [query, cat, sort])

  return (
    <>
      <Seo title="전체 글" path="/posts" description="PANCO_IT 블로그의 모든 IT 지식 글 목록" />

      <div className="blog">
        <Sidebar />

        <div className="blog__main">
          <header className="feed-head">
            <p className="feed-head__eyebrow">모든 글을 한곳에</p>
            <h1>전체 글</h1>
            <p className="feed-head__desc">총 {posts.length}개의 글이 있어요.</p>
          </header>

          <div className="post-filter">
            <div className="fbox fbox--search">
              <svg className="fbox__icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="search"
                className="fbox__input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색"
                aria-label="글 검색"
              />
            </div>
            <div className="fbox">
              <svg className="fbox__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 5h18l-7 8v6l-4 2v-8z" />
              </svg>
              <select
                className="fbox__select"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                aria-label="카테고리 필터"
              >
                <option value="">전체 카테고리</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="fbox">
              <svg className="fbox__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16M6 12h12M9 18h6" />
              </svg>
              <select
                className="fbox__select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="정렬"
              >
                <option value="new">최신순</option>
                <option value="old">오래된순</option>
                <option value="cat">카테고리순</option>
              </select>
            </div>
          </div>

          <p className="post-filter__count muted">{list.length}개</p>

          {list.length === 0 ? (
            <p className="muted">조건에 맞는 글이 없어요.</p>
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
