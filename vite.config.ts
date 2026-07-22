import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeShiki from '@shikijs/rehype'
// @ts-expect-error - JS 플러그인(타입 선언 없음), dev 전용 관리자 API
import { adminApiPlugin } from './vite-admin.mjs'

export default defineConfig(({ command, isSsrBuild }) => ({
  // GitHub Pages 프로젝트 페이지는 /INFO_IT/ 하위에서 서빙됨.
  // build 시 자동으로 '/INFO_IT/'(자산·라우터 basename 모두 이 값 사용).
  // dev(vite) 는 '/'. VITE_BASE 로 오버라이드 가능(커스텀 도메인 배포 시 '/').
  base: process.env.VITE_BASE || (command === 'build' ? '/INFO_IT/' : '/'),
  build: {
    // 렌더 최적화: react 런타임을 별도 청크로 분리(앱 코드 변경과 무관하게 캐싱 유지).
    // SSR 빌드는 단일 엔트리라 manualChunks 미적용.
    rollupOptions: isSsrBuild
      ? undefined
      : {
          output: {
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
            },
          },
        },
  },
  plugins: [
    // localhost 전용 관리자 저장 API (dev 에서만 동작, 프로덕션 미포함)
    adminApiPlugin(),
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
