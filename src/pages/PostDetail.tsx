import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import Seo from '../components/Seo'
import ReadingProgress from '../components/ReadingProgress'
import TableOfContents from '../components/TableOfContents'
import PostCard from '../components/PostCard'
import AdUnit from '../components/ads/AdUnit'
import { getPost, getRelatedPosts } from '../lib/posts'
import { formatDate, readingMinutes } from '../lib/format'
import { site } from '../site.config'
import NotFound from './NotFound'

const ARTICLE_ID = 'article-body'

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined
  const articleRef = useRef<HTMLDivElement>(null)
  const [minutes, setMinutes] = useState<number | null>(null)

  useEffect(() => {
    if (articleRef.current) {
      setMinutes(readingMinutes(articleRef.current.textContent ?? ''))
    }
  }, [slug])

  if (!post) return <NotFound />

  const related = getRelatedPosts(post)
  const { Component } = post

  return (
    <>
      <Seo
        title={post.title}
        description={post.description}
        path={`/posts/${post.slug}`}
        type="article"
        article
        publishedTime={post.date}
        modifiedTime={post.date}
        tags={post.tags}
        image={post.cover}
        noindex={post.draft}
      />
      <ReadingProgress />

      <div className="post-layout">
        <article>
          <header className="post-header">
            {post.category && (
              <Link to={`/category/${encodeURIComponent(post.category)}`} className="tag">
                {post.category}
              </Link>
            )}
            <h1 style={{ marginTop: '0.75rem' }}>{post.title}</h1>
            <div className="post-header__meta">
              <span>{site.author.name}</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {minutes && <span>· 약 {minutes}분 읽기</span>}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="tag-row" style={{ marginTop: '1rem' }}>
                {post.tags.map((t) => (
                  <span key={t} className="tag">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </header>

          <AdUnit slot="post-top" />

          <div id={ARTICLE_ID} ref={articleRef} className="prose" style={{ marginTop: '2rem' }}>
            <MDXProvider>
              <Component />
            </MDXProvider>
          </div>

          {/* 저자 바이오 — E-E-A-T 신뢰 신호 */}
          <div
            style={{
              marginTop: '3rem',
              padding: '1.4rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <strong>{site.author.name}</strong>
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              {site.author.bio}
            </p>
          </div>

          <AdUnit slot="post-bottom" />
        </article>

        <TableOfContents containerId={ARTICLE_ID} />
      </div>

      {related.length > 0 && (
        <section>
          <div className="section-title">
            <h2>관련 글</h2>
          </div>
          <div className="bento">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
