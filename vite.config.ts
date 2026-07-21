import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeShiki from '@shikijs/rehype'

export default defineConfig({
  // GitHub Pages 프로젝트 페이지는 /INFO_IT/ 하위에서 서빙됨.
  // 빌드 시 VITE_BASE=/INFO_IT/ 로 지정. dev/일반 빌드는 '/'.
  base: process.env.VITE_BASE || '/',
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
})
