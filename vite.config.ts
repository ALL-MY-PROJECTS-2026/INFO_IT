import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeShiki from '@shikijs/rehype'

export default defineConfig(({ command }) => ({
  // GitHub Pages 프로젝트 페이지는 /INFO_IT/ 하위에서 서빙됨.
  // build 시 자동으로 '/INFO_IT/'(자산·라우터 basename 모두 이 값 사용).
  // dev(vite) 는 '/'. VITE_BASE 로 오버라이드 가능(커스텀 도메인 배포 시 '/').
  base: process.env.VITE_BASE || (command === 'build' ? '/INFO_IT/' : '/'),
  plugins: [
    // MDX must run before the React plugin so JSX from posts is transformed.
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          [
            rehypeShiki,
            {
              // Dual theme → switched via CSS variables (see index.css)
              themes: { light: 'github-light', dark: 'github-dark' },
            },
          ],
        ],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
}))
