import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminApi, type PostItem } from './api'
import { parseFrontmatter, stringifyFrontmatter, type Frontmatter } from './frontmatter'
import MdxEditor from './MdxEditor'
import './admin.css'

type Tab = 'structure' | 'pages' | 'posts'

/**
 * localhost 전용 관리자 패널. src/content 의 site.json·pages·posts 를 CRUD.
 * import.meta.env.DEV 에서만 라우팅되며 프로덕션 번들엔 포함되지 않는다.
 */
export default function Admin() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'structure'
  const setTab = (t: Tab) => setParams({ tab: t })

  return (
    <div className="admin container">
      <div className="admin__head">
        <h1>
          🔧 관리자 모드 <span className="admin__badge">localhost 전용</span>
        </h1>
      </div>
      <div className="admin__note">
        여기서 편집 → <b>저장</b>하면 <code>src/content/</code> 파일에 기록됩니다(화면 즉시 갱신).
        만족스러우면 <code>git commit &amp; push</code> → 자동 배포로 라이브에 반영됩니다.
        이 관리자 화면은 <b>공개 사이트엔 포함되지 않습니다.</b>
      </div>

      <nav className="admin__tabs">
        <button className={tab === 'structure' ? 'on' : ''} onClick={() => setTab('structure')}>
          카테고리 · 메뉴 · 정보
        </button>
        <button className={tab === 'pages' ? 'on' : ''} onClick={() => setTab('pages')}>
          페이지(소개·문의…)
        </button>
        <button className={tab === 'posts' ? 'on' : ''} onClick={() => setTab('posts')}>
          글
        </button>
      </nav>

      {tab === 'structure' && <StructureEditor />}
      {tab === 'pages' && <PagesEditor initial={params.get('slug') || 'about'} />}
      {tab === 'posts' && <PostsEditor initial={params.get('slug')} />}
    </div>
  )
}

function swap<T>(a: T[], i: number, j: number): T[] {
  const n = [...a]
  ;[n[i], n[j]] = [n[j], n[i]]
  return n
}

/* ── 카테고리 · 메뉴 · 사이트 정보 (site.json) ─────────────────────── */
interface Cat {
  label: string
  desc: string
}
interface NavItem {
  label: string
  to: string
}
function StructureEditor() {
  const [site, setSite] = useState<Record<string, unknown> | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    adminApi.getSite().then(setSite).catch((e) => setStatus('로드 실패: ' + e.message))
  }, [])

  if (!site) return <p className="muted">{status || '불러오는 중…'}</p>

  const cats = (site.categories as Cat[]) || []
  const nav = (site.nav as NavItem[]) || []
  const patch = (p: Record<string, unknown>) => setSite({ ...site, ...p })

  const save = async () => {
    setStatus('저장 중…')
    try {
      await adminApi.putSite(site)
      setStatus('✅ 저장됨 — 새로고침하면 반영됩니다')
    } catch (e) {
      setStatus('❌ ' + (e as Error).message)
    }
  }

  return (
    <div>
      <section className="admin__card">
        <h2>사이트 정보</h2>
        <label>
          제목
          <input value={String(site.title || '')} onChange={(e) => patch({ title: e.target.value })} />
        </label>
        <label>
          설명
          <textarea
            rows={2}
            value={String(site.description || '')}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </label>
      </section>

      <section className="admin__card">
        <h2>왼쪽 카테고리 ({cats.length})</h2>
        {cats.map((c, i) => (
          <div className="admin__row" key={i}>
            <input
              placeholder="이름"
              value={c.label}
              onChange={(e) => patch({ categories: cats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
            />
            <input
              placeholder="설명"
              value={c.desc}
              onChange={(e) => patch({ categories: cats.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })}
            />
            <button onClick={() => patch({ categories: cats.filter((_, j) => j !== i) })}>삭제</button>
            <button disabled={i === 0} onClick={() => patch({ categories: swap(cats, i, i - 1) })}>
              ↑
            </button>
            <button disabled={i === cats.length - 1} onClick={() => patch({ categories: swap(cats, i, i + 1) })}>
              ↓
            </button>
          </div>
        ))}
        <button onClick={() => patch({ categories: [...cats, { label: '새 카테고리', desc: '' }] })}>
          + 카테고리 추가
        </button>
        <p className="muted" style={{ marginTop: '.5rem', fontSize: '.82rem' }}>
          ※ 실제 사이드바엔 글이 있는 카테고리만 표시됩니다.
        </p>
      </section>

      <section className="admin__card">
        <h2>상단 메뉴 ({nav.length})</h2>
        {nav.map((c, i) => (
          <div className="admin__row" key={i}>
            <input
              placeholder="라벨"
              value={c.label}
              onChange={(e) => patch({ nav: nav.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
            />
            <input
              placeholder="경로 (예: /about)"
              value={c.to}
              onChange={(e) => patch({ nav: nav.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) })}
            />
            <button onClick={() => patch({ nav: nav.filter((_, j) => j !== i) })}>삭제</button>
          </div>
        ))}
        <button onClick={() => patch({ nav: [...nav, { label: '새 메뉴', to: '/' }] })}>+ 메뉴 추가</button>
      </section>

      <div className="admin__save">
        <button className="admin__primary" onClick={save}>
          저장
        </button>
        <span className="muted">{status}</span>
      </div>
    </div>
  )
}

/* ── 페이지(소개·문의·개인정보·약관) MDX ──────────────────────────── */
const PAGE_LIST: [string, string][] = [
  ['about', '소개'],
  ['contact', '문의'],
  ['privacy', '개인정보처리방침'],
  ['terms', '이용약관'],
]
function PagesEditor({ initial }: { initial: string }) {
  const [slug, setSlug] = useState(initial)
  const [raw, setRaw] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    setStatus('로딩…')
    adminApi
      .getPage(slug)
      .then((d) => {
        setRaw(d.raw)
        setStatus('')
      })
      .catch((e) => setStatus(e.message))
  }, [slug])

  const save = async () => {
    setStatus('저장 중…')
    try {
      await adminApi.putPage(slug, raw)
      setStatus('✅ 저장됨 — 새로고침하면 반영됩니다')
    } catch (e) {
      setStatus('❌ ' + (e as Error).message)
    }
  }

  return (
    <div>
      <div className="admin__row">
        {PAGE_LIST.map(([s, label]) => (
          <button key={s} className={slug === s ? 'admin__primary' : ''} onClick={() => setSlug(s)}>
            {label}
          </button>
        ))}
      </div>
      <p className="muted" style={{ fontSize: '.85rem' }}>
        MDX(마크다운) 형식. 맨 위 <code>--- title: … ---</code> 블록은 그대로 두세요. 이미지·링크는 아래 툴바로 넣을 수 있습니다.
      </p>
      <MdxEditor value={raw} onChange={setRaw} rows={20} />
      <div className="admin__save">
        <button className="admin__primary" onClick={save}>
          저장
        </button>
        <span className="muted">{status}</span>
      </div>
    </div>
  )
}

/* ── 글 목록 / 편집 ──────────────────────────────────────────────── */
function PostsEditor({ initial }: { initial: string | null }) {
  const [items, setItems] = useState<PostItem[] | null>(null)
  const [editing, setEditing] = useState<string | null>(initial)
  const reload = () => adminApi.listPosts().then((d) => setItems(d.items))

  useEffect(() => {
    reload()
  }, [])

  if (editing !== null) {
    return (
      <PostForm
        slug={editing === '__new__' ? null : editing}
        onDone={() => {
          setEditing(null)
          reload()
        }}
      />
    )
  }

  return (
    <div>
      <div className="admin__save">
        <button className="admin__primary" onClick={() => setEditing('__new__')}>
          + 새 글 작성
        </button>
      </div>
      {!items && <p className="muted">불러오는 중…</p>}
      <ul className="admin__list">
        {items?.map((p) => (
          <li key={p.slug}>
            <span className="t">
              {p.title} {p.draft && <em>(준비중)</em>}
              <br />
              <span className="c">
                {p.slug}
                {p.category ? ` · ${p.category}` : ''}
              </span>
            </span>
            <button onClick={() => setEditing(p.slug)}>편집</button>
            <button
              onClick={async () => {
                if (confirm(`'${p.title}' 글을 삭제할까요? (파일이 지워집니다)`)) {
                  await adminApi.delPost(p.slug)
                  reload()
                }
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PostForm({ slug, onDone }: { slug: string | null; onDone: () => void }) {
  const isNew = slug === null
  const [cats, setCats] = useState<string[]>([])
  const [fileSlug, setFileSlug] = useState(slug || '')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [draft, setDraft] = useState(false)
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    adminApi.getSite().then((s) => setCats(((s.categories as { label: string }[]) || []).map((c) => c.label)))
  }, [])

  useEffect(() => {
    if (isNew) {
      setDate(new Date().toISOString().slice(0, 10))
      setBody('여기에 내용을 작성하세요.\n')
      return
    }
    adminApi.getPost(slug!).then((d) => {
      const { fm, body } = parseFrontmatter(d.raw)
      setTitle(String(fm.title || ''))
      setCategory(String(fm.category || ''))
      setDate(String(fm.date || ''))
      setDescription(String(fm.description || ''))
      setTags(Array.isArray(fm.tags) ? fm.tags.join(', ') : String(fm.tags || ''))
      setDraft(fm.draft === true)
      setBody(body)
    })
  }, [slug, isNew])

  const save = async () => {
    const s = (isNew ? fileSlug : slug!).trim()
    if (!/^[a-z0-9-]+$/i.test(s)) {
      setStatus('❌ 파일명(slug)은 영문/숫자/하이픈만 가능합니다')
      return
    }
    const fm: Frontmatter = { title, date }
    if (description) fm.description = description
    if (category) fm.category = category
    const tg = tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (tg.length) fm.tags = tg
    if (draft) fm.draft = true
    setStatus('저장 중…')
    try {
      await adminApi.putPost(s, stringifyFrontmatter(fm, body))
      setStatus('✅ 저장됨')
      onDone()
    } catch (e) {
      setStatus('❌ ' + (e as Error).message)
    }
  }

  return (
    <div>
      <button onClick={onDone}>← 목록으로</button>
      <h2 style={{ margin: '.8rem 0' }}>{isNew ? '새 글 작성' : `글 편집: ${slug}`}</h2>
      <label>
        제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      {isNew && (
        <label>
          파일명(slug) — URL 이 됩니다 (예: my-first-post)
          <input value={fileSlug} onChange={(e) => setFileSlug(e.target.value)} placeholder="my-first-post" />
        </label>
      )}
      <label>
        카테고리
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">(없음)</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        날짜
        <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="YYYY-MM-DD" />
      </label>
      <label>
        설명(SEO)
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label>
        태그 (쉼표로 구분)
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, seo" />
      </label>
      <label className="admin__check">
        <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} /> 준비중(draft) — 목록·사이트맵 제외
      </label>
      <label>본문 (MDX / 마크다운) — 이미지·링크는 툴바 사용</label>
      <MdxEditor value={body} onChange={setBody} rows={16} />
      <div className="admin__save">
        <button className="admin__primary" onClick={save}>
          저장
        </button>
        <span className="muted">{status}</span>
      </div>
    </div>
  )
}
