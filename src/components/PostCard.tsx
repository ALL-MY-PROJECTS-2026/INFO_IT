import { Link } from 'react-router-dom'
import type { Post } from '../lib/posts'
import { formatDate } from '../lib/format'

export default function PostCard({
  post,
  featured = false,
}: {
  post: Post
  featured?: boolean
}) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className={`post-card ${featured ? 'post-card--featured' : ''}`}
    >
      {post.category && <span className="tag" style={{ alignSelf: 'flex-start' }}>{post.category}</span>}
      <h3 style={{ marginTop: post.category ? '0.75rem' : 0 }}>{post.title}</h3>
      <p>{post.description}</p>
      <div className="post-card__meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.tags && post.tags.length > 0 && <span>· {post.tags.slice(0, 3).join(', ')}</span>}
      </div>
    </Link>
  )
}
