import type { ComponentType } from 'react'
import type { Frontmatter } from '../types'

interface PostModule {
  default: ComponentType<Record<string, unknown>>
  frontmatter: Frontmatter
}

export interface Post extends Frontmatter {
  slug: string
  Component: ComponentType<Record<string, unknown>>
}

// 빌드 타임에 모든 글을 정적으로 수집 (SSG 프리렌더 대상)
const modules = import.meta.glob<PostModule>('../content/posts/*.mdx', {
  eager: true,
})

export const posts: Post[] = Object.entries(modules)
  .map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace(/\.mdx$/, '')
    return { slug, Component: mod.default, ...mod.frontmatter }
  })
  // 실제 글(작성 완료) 우선, 그다음 최신 날짜순. 준비 중(draft)은 뒤로.
  .sort((a, b) => {
    const draftDiff = Number(!!a.draft) - Number(!!b.draft)
    if (draftDiff !== 0) return draftDiff
    return a.date < b.date ? 1 : -1
  })

/** 작성 완료된(공개) 글만 — 홈/전체글 피드·사이트맵용 */
export const livePosts: Post[] = posts.filter((p) => !p.draft)

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

/**
 * 공개(비-draft) 글 기준 카테고리 목록 (글 수 포함).
 * draft 스텁이 빈 카테고리를 만들지 않도록 livePosts 만 집계합니다.
 */
export function getCategories(): { name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const p of livePosts) {
    if (!p.category) continue
    map.set(p.category, (map.get(p.category) ?? 0) + 1)
  }
  return [...map.entries()].map(([name, count]) => ({ name, count }))
}

/** 카테고리별 공개 글 목록 (draft 제외) */
export function getPostsByCategory(category: string): Post[] {
  return livePosts.filter((p) => p.category === category)
}

/** 특정 카테고리의 공개 글 개수 (사이드바 배지용, draft 제외) */
export function postCountByCategory(category: string): number {
  return livePosts.filter((p) => p.category === category).length
}

/** 같은 카테고리/태그 기준 관련 글 추천 (draft 제외) */
export function getRelatedPosts(current: Post, limit = 3): Post[] {
  return livePosts
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = 0
      if (p.category && p.category === current.category) score += 2
      const shared = (p.tags ?? []).filter((t) => (current.tags ?? []).includes(t))
      score += shared.length
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p)
}
