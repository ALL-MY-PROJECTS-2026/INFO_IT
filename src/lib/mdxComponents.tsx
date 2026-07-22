import type { ComponentProps } from 'react'

/**
 * 글·페이지 MDX 안의 이미지/링크가 dev('/')·프로덕션('/INFO_IT/') 양쪽에서 깨지지 않도록,
 * 루트-상대(`/uploads/…`, `/posts/…`) 경로에 사이트 base 를 자동으로 붙인다.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

function withBase(url?: string): string | undefined {
  if (url && url.startsWith('/') && !url.startsWith('//')) return BASE + url
  return url
}

function Img(props: ComponentProps<'img'>) {
  return <img {...props} src={withBase(props.src)} loading="lazy" />
}

function A({ href: rawHref, children, ...rest }: ComponentProps<'a'>) {
  const href = withBase(rawHref)
  const external = !!href && /^https?:/i.test(href)
  return (
    <a {...rest} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  )
}

export const mdxComponents = { img: Img, a: A }
