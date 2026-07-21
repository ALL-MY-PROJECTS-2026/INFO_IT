export interface Frontmatter {
  title: string
  date: string
  description: string
  tags?: string[]
  category?: string
  cover?: string
  /** true 면 준비 중(placeholder) 글 — 피드/사이트맵 제외, 상세는 noindex */
  draft?: boolean
}
