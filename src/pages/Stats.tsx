import { useEffect, useState, type FormEvent } from 'react'
import Seo from '../components/Seo'
import { site } from '../site.config'

const AUTH_KEY = 'panco-stats-auth'

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 방문 통계 페이지. 배포 사이트에서는 아이디/비밀번호(관리자)만 대시보드를 볼 수 있다.
 *  - 비밀번호는 SHA-256 해시로만 비교(평문 미저장).
 *  - 대시보드 iframe 은 인증 성공 후에만 렌더 → 정적 HTML·크롤러에 노출되지 않음(noindex).
 *  ⚠️ 정적 호스팅 특성상 클라이언트 게이트는 완전한 보안이 아님(캐주얼 열람 차단 수준).
 */
export default function Stats() {
  const url = site.analytics.lookerStudioEmbedUrl
  const gate = site.statsAuth

  const [authed, setAuthed] = useState(false)
  const [ready, setReady] = useState(false) // 세션 확인 완료(하이드레이션 이후)
  const [user, setUser] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      if (!gate.enabled || sessionStorage.getItem(AUTH_KEY) === 'ok') setAuthed(true)
    } catch {
      /* noop */
    }
    setReady(true)
  }, [gate.enabled])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const ok = user.trim() === gate.user && (await sha256Hex(gate.salt + pw)) === gate.passHash
      if (ok) {
        try {
          sessionStorage.setItem(AUTH_KEY, 'ok')
        } catch {
          /* noop */
        }
        setAuthed(true)
      } else {
        setErr('아이디 또는 비밀번호가 올바르지 않습니다.')
      }
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    try {
      sessionStorage.removeItem(AUTH_KEY)
    } catch {
      /* noop */
    }
    setAuthed(false)
    setUser('')
    setPw('')
  }

  return (
    <div className="page stats-page">
      <Seo
        title="방문 통계"
        path="/stats"
        description={`${site.title}의 방문자 통계 (관리자 전용).`}
        noindex
      />
      <h1>방문 통계</h1>
      <p className="muted">
        이 블로그의 방문 데이터는 Google Analytics 4 로 집계됩니다. 대시보드는 <b>관리자 로그인</b> 후 볼 수 있습니다.
      </p>

      {!authed ? (
        <form className="stats-login" onSubmit={submit}>
          <div className="stats-login__title">관리자 로그인</div>
          <label>
            아이디
            <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" autoCapitalize="none" />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {err && <p className="stats-login__err">{err}</p>}
          <button className="btn" type="submit" disabled={busy || !ready}>
            {busy ? '확인 중…' : '로그인'}
          </button>
        </form>
      ) : url ? (
        <>
          <div className="stats-embed">
            <iframe
              src={url}
              title="방문 통계 대시보드 (Looker Studio)"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              allowFullScreen
            />
          </div>
          <p style={{ marginTop: '0.9rem' }}>
            <button className="btn btn--ghost" type="button" onClick={logout}>
              로그아웃
            </button>
          </p>
        </>
      ) : (
        <section
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem 1.4rem',
            border: '1px dashed var(--border)',
            borderRadius: 8,
            background: 'var(--bg-subtle)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>대시보드 준비 중</h2>
          <p>
            공개 방문 통계 대시보드를 아직 연결하지 않았습니다. <code>src/site.config.ts</code> 의{' '}
            <code>analytics.lookerStudioEmbedUrl</code> 에 Looker Studio 임베드 URL 을 넣으면 이 자리에 표시됩니다.
          </p>
        </section>
      )}
    </div>
  )
}
