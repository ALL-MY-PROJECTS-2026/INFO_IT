import type { ComponentType } from 'react'

/**
 * 정적 페이지(소개·문의·개인정보·약관) 콘텐츠.
 * src/content/pages/*.mdx 를 빌드 타임에 수집한다. 향후 관리자모드에서 이 MDX 를 편집한다.
 */
export interface PageFrontmatter {
  title: string
  description?: string
}

interface PageModule {
  default: ComponentType<Record<string, unknown>>
  frontmatter: PageFrontmatter
}

export interface Page {
  slug: string
  Component: ComponentType<Record<string, unknown>>
  frontmatter: PageFrontmatter
}

const modules = import.meta.glob<PageModule>('../content/pages/*.mdx', { eager: true })

const pages: Record<string, Page> = {}
for (const [path, mod] of Object.entries(modules)) {
  const slug = path.split('/').pop()!.replace(/\.mdx$/, '')
  pages[slug] = { slug, Component: mod.default, frontmatter: mod.frontmatter }
}

export function getPage(slug: string): Page | undefined {
  return pages[slug]
}
