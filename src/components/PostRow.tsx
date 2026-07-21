import { Link } from 'react-router-dom'
import type { Post } from '../lib/posts'
import { formatDate } from '../lib/format'

/** 블로그 리스트 피드의 한 줄 (홈·전체글·카테고리 공통) */
export default function PostRow({ post }: { post: Post }) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className={`post-row ${post.draft ? 'post-row--draft' : ''}`}
    >
      <div className="post-row__meta">
        {post.category && <span className="post-row__cat">{post.category}</span>}
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.draft && <span className="post-row__badge">작성 예정</span>}
      </div>
      <h3 className="post-row__title">{post.title}</h3>
      <p className="post-row__excerpt">{post.description}</p>
    </Link>
  )
}
