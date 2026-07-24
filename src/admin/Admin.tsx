import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminApi, type PostItem } from './api'
import { parseFrontmatter, stringifyFrontmatter, type Frontmatter } from './frontmatter'
import MdxEditor from './MdxEditor'
import './admin.css'

type Tab = 'structure' | 'pages' | 'posts'

const pad2 = (n: number) => String(n).padStart(2, '0')

/** 현재 로컬 시각을 datetime-local 값(YYYY-MM-DDTHH:MM)으로. */
function localDateTimeNow(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** 저장된 date 문자열을 datetime-local 입력값으로 정규화. 날짜만 있으면 T00:00 을 붙인다. */
function toLocalDateTimeInput(raw: string): string {
  if (!raw) return ''
  const s = raw.replace(' ', 'T')
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s + 'T00:00'
  return s.slice(0, 16)
}

/**
 * 우측 상단 '커밋 · 배포' 버튼.
 * localhost 미들웨어(/__admin/api/git)가 git add·commit·push 를 실행 →
 * GitHub Actions 가 자동 빌드·배포하여 라이브(글 포함)에 반영된다.
 */
function GitDeployButton() {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [ok, setOk] = useState<boolean | null>(null)
  const [msg, setMsg] = useState('')

  const run = async () => {
    if (busy) return
    setBusy(true)
    setOk(null)
    setStatus('커밋·푸시 중…')
    try {
      const r = await adminApi.gitPush(msg.trim() || undefined)
      setOk(true)
      setStatus(
        r.committed
          ? `배포 시작됨 (${r.head}) — 2~3분 뒤 라이브 반영`
          : `변경 없음 · 기존 커밋 푸시됨 (${r.head})`,
      )
      setMsg('')
    } catch (e) {
      setOk(false)
      setStatus('오류: ' + (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin__deploy">
      <input
        className="admin__deploy-msg"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="커밋 메시지 (선택)"
        disabled={busy}
      />
      <button className="admin__deploy-btn" onClick={run} disabled={busy}>
        {busy ? '배포 중…' : '커밋 · 배포'}
      </button>
      {status && (
        <span className={`admin__deploy-status ${ok === false ? 'err' : ok ? 'ok' : ''}`}>{status}</span>
      )}
    </div>
  )
}

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
          관리자 모드 <span className="admin__badge">localhost 전용</span>
        </h1>
        <GitDeployButton />
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
  group: string
}
interface NavItem {
  label: string
  to: string
}
interface FooterData {
  tagline: string
  copyright: string
  links: NavItem[]
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
  const footer = (site.footer as FooterData) || { tagline: '', copyright: '', links: [] }
  const patch = (p: Record<string, unknown>) => setSite({ ...site, ...p })

  // ── 카테고리(그룹→세부토픽) 조작 헬퍼 ──
  const groupOrder: string[] = []
  for (const c of cats) {
    const g = c.group || ''
    if (!groupOrder.includes(g)) groupOrder.push(g)
  }
  const idxOfGroup = (g: string) =>
    cats.map((c, i) => ({ c, i })).filter((x) => (x.c.group || '') === g).map((x) => x.i)
  const setCats = (next: Cat[]) => patch({ categories: next })
  const updateCat = (i: number, field: 'label' | 'desc', v: string) =>
    setCats(cats.map((c, j) => (j === i ? { ...c, [field]: v } : c)))
  const deleteCat = (i: number) => setCats(cats.filter((_, j) => j !== i))
  const addTopic = (g: string) => setCats([...cats, { label: '새 토픽', desc: '', group: g }])
  // 같은 그룹 안에서만 우선순위(순서) 이동
  const moveTopic = (i: number, dir: -1 | 1) => {
    const sib = idxOfGroup(cats[i].group || '')
    const target = sib[sib.indexOf(i) + dir]
    if (target !== undefined) setCats(swap(cats, i, target))
  }
  const renameGroup = (oldG: string, newG: string) =>
    setCats(cats.map((c) => ((c.group || '') === oldG ? { ...c, group: newG } : c)))
  // 그룹 블록 전체의 순서 이동
  const moveGroup = (g: string, dir: -1 | 1) => {
    const order = [...groupOrder]
    const pos = order.indexOf(g)
    if (pos + dir < 0 || pos + dir >= order.length) return
    ;[order[pos], order[pos + dir]] = [order[pos + dir], order[pos]]
    const rebuilt: Cat[] = []
    for (const gn of order) rebuilt.push(...cats.filter((c) => (c.group || '') === gn))
    setCats(rebuilt)
  }

  const save = async () => {
    setStatus('저장 중…')
    try {
      await adminApi.putSite(site)
      setStatus('저장됨 — 새로고침하면 반영됩니다')
    } catch (e) {
      setStatus('오류: ' + (e as Error).message)
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
        <h2>왼쪽 카테고리 · 세부토픽</h2>
        <p className="muted" style={{ marginBottom: '.7rem', fontSize: '.82rem' }}>
          그룹 안 토픽의 <b>↑↓</b> 로 <b>우선순위(순서)</b>를 바꾸고, 그룹의 <b>▲▼</b> 로 그룹 순서를 바꿉니다.
          그룹명을 비우면 그 토픽들은 사이드바에 평면으로 표시됩니다.
        </p>
        {groupOrder.map((g, gi) => (
          <div className="admin__group" key={'g' + gi}>
            <div className="admin__group-head">
              <input
                className="admin__group-name"
                placeholder="(그룹 없음)"
                value={g}
                onChange={(e) => renameGroup(g, e.target.value)}
              />
              <span className="muted" style={{ fontSize: '.76rem' }}>그룹 순서</span>
              <button disabled={gi === 0} onClick={() => moveGroup(g, -1)} title="그룹 위로">
                ▲
              </button>
              <button disabled={gi === groupOrder.length - 1} onClick={() => moveGroup(g, 1)} title="그룹 아래로">
                ▼
              </button>
            </div>
            {idxOfGroup(g).map((i, ti, arr) => (
              <div className="admin__row" key={i}>
                <input placeholder="토픽 이름" value={cats[i].label} onChange={(e) => updateCat(i, 'label', e.target.value)} />
                <input placeholder="설명" value={cats[i].desc} onChange={(e) => updateCat(i, 'desc', e.target.value)} />
                <button disabled={ti === 0} onClick={() => moveTopic(i, -1)} title="우선순위 올리기">
                  ↑
                </button>
                <button disabled={ti === arr.length - 1} onClick={() => moveTopic(i, 1)} title="우선순위 내리기">
                  ↓
                </button>
                <button onClick={() => deleteCat(i)}>삭제</button>
              </div>
            ))}
            <button onClick={() => addTopic(g)}>+ 이 그룹에 토픽 추가</button>
          </div>
        ))}
        <button className="admin__primary" onClick={() => addTopic('새 그룹')} style={{ marginTop: '.2rem' }}>
          + 새 그룹 추가
        </button>
        <p className="muted" style={{ marginTop: '.6rem', fontSize: '.82rem' }}>
          ※ 실제 사이드바엔 글이 있는 토픽만 표시됩니다(빈 토픽은 자동 숨김).
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

      <section className="admin__card">
        <h2>푸터</h2>
        <label>
          소개 문구
          <textarea
            rows={2}
            value={footer.tagline}
            onChange={(e) => patch({ footer: { ...footer, tagline: e.target.value } })}
          />
        </label>
        <label>
          저작권 문구 (<code>{'{year}'}</code> 는 현재 연도로 자동 치환됩니다)
          <input
            value={footer.copyright}
            onChange={(e) => patch({ footer: { ...footer, copyright: e.target.value } })}
          />
        </label>
        <div style={{ fontWeight: 600, margin: '.7rem 0 .35rem' }}>링크 ({footer.links.length})</div>
        {footer.links.map((c, i) => (
          <div className="admin__row" key={i}>
            <input
              placeholder="라벨"
              value={c.label}
              onChange={(e) =>
                patch({
                  footer: { ...footer, links: footer.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) },
                })
              }
            />
            <input
              placeholder="경로 (예: /about)"
              value={c.to}
              onChange={(e) =>
                patch({
                  footer: { ...footer, links: footer.links.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) },
                })
              }
            />
            <button onClick={() => patch({ footer: { ...footer, links: footer.links.filter((_, j) => j !== i) } })}>
              삭제
            </button>
            <button disabled={i === 0} onClick={() => patch({ footer: { ...footer, links: swap(footer.links, i, i - 1) } })}>
              ↑
            </button>
            <button
              disabled={i === footer.links.length - 1}
              onClick={() => patch({ footer: { ...footer, links: swap(footer.links, i, i + 1) } })}
            >
              ↓
            </button>
          </div>
        ))}
        <button onClick={() => patch({ footer: { ...footer, links: [...footer.links, { label: '새 링크', to: '/' }] } })}>
          + 링크 추가
        </button>
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
      setStatus('저장됨 — 새로고침하면 반영됩니다')
    } catch (e) {
      setStatus('오류: ' + (e as Error).message)
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
        MDX(마크다운) 형식. 맨 위 <code>--- title: … ---</code> 블록은 그대로 두십시오. 이미지·링크는 아래 툴바로 넣을 수 있습니다.
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
                if (confirm(`'${p.title}' 글을 삭제하시겠습니까? (파일이 지워집니다)`)) {
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
  const [cats, setCats] = useState<{ label: string; group: string }[]>([])
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
    adminApi.getSite().then((s) =>
      setCats(
        ((s.categories as { label: string; group?: string }[]) || []).map((c) => ({
          label: c.label,
          group: c.group || '',
        })),
      ),
    )
  }, [])

  useEffect(() => {
    if (isNew) {
      setDate(localDateTimeNow())
      setBody('여기에 내용을 작성합니다.\n')
      return
    }
    adminApi.getPost(slug!).then((d) => {
      const { fm, body } = parseFrontmatter(d.raw)
      setTitle(String(fm.title || ''))
      setCategory(String(fm.category || ''))
      setDate(toLocalDateTimeInput(String(fm.date || '')))
      setDescription(String(fm.description || ''))
      setTags(Array.isArray(fm.tags) ? fm.tags.join(', ') : String(fm.tags || ''))
      setDraft(fm.draft === true)
      setBody(body)
    })
  }, [slug, isNew])

  const save = async () => {
    const s = (isNew ? fileSlug : slug!).trim()
    if (!/^[a-z0-9-]+$/i.test(s)) {
      setStatus('파일명(slug)은 영문/숫자/하이픈만 가능합니다')
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
      setStatus('저장됨')
      onDone()
    } catch (e) {
      setStatus('오류: ' + (e as Error).message)
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
          {cats
            .filter((c) => !c.group)
            .map((c) => (
              <option key={c.label} value={c.label}>
                {c.label}
              </option>
            ))}
          {[...new Set(cats.filter((c) => c.group).map((c) => c.group))].map((g) => (
            <optgroup key={g} label={g}>
              {cats
                .filter((c) => c.group === g)
                .map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label>
        날짜·시간
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
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
