// 커스텀 SSG 프리렌더 (Node 24 안전).
// 1) 클라이언트 빌드(dist)의 index.html 을 템플릿으로 사용
// 2) SSR 번들(dist-ssr)의 render(url) 로 각 경로를 정적 HTML 로 렌더
// 3) <!--app-html-->, <!--app-head--> 자리에 주입 후 dist 에 경로별 index.html 작성
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, 'dist')

const template = readFileSync(join(distDir, 'index.html'), 'utf-8')
const { render, getPrerenderPaths } = await import('./dist-ssr/entry-server.js')

const paths = getPrerenderPaths()

function outFileFor(urlPath) {
  if (urlPath === '/') return join(distDir, 'index.html')
  // /posts/foo → dist/posts/foo/index.html (깔끔한 URL)
  return join(distDir, urlPath, 'index.html')
}

let count = 0
for (const urlPath of paths) {
  const { html, head } = render(urlPath)
  const page = template
    .replace('<!--app-html-->', html)
    .replace('<!--app-head-->', head)
  const outFile = outFileFor(urlPath)
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, page, 'utf-8')
  count++
}

// 404 페이지: 매칭되지 않는 경로 → NotFound 렌더 → dist/404.html
{
  const { html, head } = render('/__not_found__')
  const page = template
    .replace('<!--app-html-->', html)
    .replace('<!--app-head-->', head)
  writeFileSync(join(distDir, '404.html'), page, 'utf-8')
}

console.log(`✓ 프리렌더 완료: ${count} 페이지 + 404.html`)
