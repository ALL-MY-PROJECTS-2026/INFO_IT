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

function Img({ src: rawSrc, style, ...rest }: ComponentProps<'img'>) {
  const src = withBase(rawSrc)
  // shields.io 기술스택 뱃지는 가로 한 줄로 흐르도록 inline-block 처리(사이트 img 기본값은 block).
  if (rawSrc && /img\.shields\.io/.test(rawSrc)) {
    return (
      <img
        {...rest}
        src={src}
        loading="lazy"
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          height: 28,
          width: 'auto',
          margin: '3px 5px 3px 0',
          ...(style as object),
        }}
      />
    )
  }
  return <img {...rest} src={src} style={style} loading="lazy" />
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
