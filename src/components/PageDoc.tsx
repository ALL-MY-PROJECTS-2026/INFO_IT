import { Link } from 'react-router-dom'
import Seo from './Seo'
import { getPage } from '../lib/pages'

/**
 * content/pages/{slug}.mdx 를 읽어 렌더하는 정적 페이지 컴포넌트.
 * 소개/문의/개인정보/약관 페이지가 이 컴포넌트를 통해 콘텐츠(MDX)만 갈아끼운다.
 */
export default function PageDoc({ slug, path }: { slug: string; path: string }) {
  const page = getPage(slug)

  if (!page) {
    return (
      <div className="page">
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="muted">content/pages/{slug}.mdx 파일이 없습니다.</p>
      </div>
    )
  }

  const { Component, frontmatter } = page
  return (
    <div className="page">
      <Seo title={frontmatter.title} path={path} description={frontmatter.description} />
      {import.meta.env.DEV && (
        <Link className="edit-fab" to={`/admin?tab=pages&slug=${slug}`}>
          ✏️ 이 페이지 편집
        </Link>
      )}
      <Component />
    </div>
  )
}
