// localhost 전용 관리자 저장 API (Vite dev 미들웨어).
//  - apply: 'serve' → vite dev 에서만 동작. 프로덕션 빌드엔 존재하지 않음(정적 gh-pages 에 서버 없음).
//  - /__admin/api/* 로 src/content 의 파일을 읽고 쓴다.
//  - 보안: 경로 화이트리스트(허용 폴더 밖·../ 차단), slug 검증, 용량 제한.
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  unlinkSync,
  mkdirSync,
} from 'node:fs'
import { resolve, sep } from 'node:path'

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i

export function adminApiPlugin() {
  const root = process.cwd()
  const SITE_JSON = resolve(root, 'src/content/site.json')
  const PAGES_DIR = resolve(root, 'src/content/pages')
  const POSTS_DIR = resolve(root, 'src/content/posts')

  function mdxPath(dir, slug) {
    if (typeof slug !== 'string' || !SLUG_RE.test(slug)) throw new Error('허용되지 않은 파일명(slug)')
    const p = resolve(dir, `${slug}.mdx`)
    if (!p.startsWith(dir + sep)) throw new Error('허용되지 않은 경로')
    return p
  }

  function listMdx(dir) {
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''))
      .sort()
  }

  function readBody(req) {
    return new Promise((res, rej) => {
      let data = ''
      req.on('data', (c) => {
        data += c
        if (data.length > 2_000_000) rej(new Error('본문이 너무 큽니다(2MB 초과)'))
      })
      req.on('end', () => res(data))
      req.on('error', rej)
    })
  }

  return {
    name: 'panco-admin-api',
    apply: 'serve', // ★ dev 전용 — 프로덕션 빌드엔 포함되지 않음
    configureServer(server) {
      server.middlewares.use('/__admin/api', async (req, res) => {
        const send = (code, obj) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(obj))
        }
        try {
          const segs = (req.url || '').split('?')[0].split('/').filter(Boolean)
          const [resource, id] = segs
          const method = req.method

          // --- 사이트 구조(카테고리·메뉴·정보) = site.json ---
          if (resource === 'site') {
            if (method === 'GET') return send(200, JSON.parse(readFileSync(SITE_JSON, 'utf-8')))
            if (method === 'PUT') {
              const obj = JSON.parse(await readBody(req)) // JSON 유효성 검증
              writeFileSync(SITE_JSON, JSON.stringify(obj, null, 2) + '\n', 'utf-8')
              return send(200, { ok: true })
            }
          }

          // --- 정적 페이지(소개·문의·개인정보·약관) = pages/*.mdx ---
          if (resource === 'pages') {
            if (method === 'GET' && !id) return send(200, { slugs: listMdx(PAGES_DIR) })
            if (id) {
              const p = mdxPath(PAGES_DIR, id)
              if (method === 'GET')
                return send(200, { slug: id, raw: existsSync(p) ? readFileSync(p, 'utf-8') : '' })
              if (method === 'PUT') {
                const b = JSON.parse(await readBody(req))
                if (!existsSync(PAGES_DIR)) mkdirSync(PAGES_DIR, { recursive: true })
                writeFileSync(p, String(b.raw ?? ''), 'utf-8')
                return send(200, { ok: true })
              }
            }
          }

          // --- 블로그 글 = posts/*.mdx ---
          if (resource === 'posts') {
            if (method === 'GET' && !id) {
              const slugs = listMdx(POSTS_DIR)
              const items = slugs.map((slug) => {
                const raw = readFileSync(mdxPath(POSTS_DIR, slug), 'utf-8')
                const m = raw.match(/title:\s*(.+)/)
                const c = raw.match(/category:\s*(.+)/)
                const d = raw.match(/draft:\s*true/)
                return {
                  slug,
                  title: m ? m[1].trim().replace(/^["']|["']$/g, '') : slug,
                  category: c ? c[1].trim().replace(/^["']|["']$/g, '') : '',
                  draft: !!d,
                }
              })
              return send(200, { items })
            }
            if (id) {
              const p = mdxPath(POSTS_DIR, id)
              if (method === 'GET')
                return send(200, { slug: id, raw: existsSync(p) ? readFileSync(p, 'utf-8') : '' })
              if (method === 'PUT') {
                const b = JSON.parse(await readBody(req))
                if (!existsSync(POSTS_DIR)) mkdirSync(POSTS_DIR, { recursive: true })
                writeFileSync(p, String(b.raw ?? ''), 'utf-8')
                return send(200, { ok: true })
              }
              if (method === 'DELETE') {
                if (existsSync(p)) unlinkSync(p)
                return send(200, { ok: true })
              }
            }
          }

          return send(404, { error: '알 수 없는 요청' })
        } catch (e) {
          return send(400, { error: String((e && e.message) || e) })
        }
      })
    },
  }
}
