import Seo from '../components/Seo'
import { site } from '../site.config'

/**
 * 방문 통계 페이지.
 *  - site.config 의 analytics.lookerStudioEmbedUrl 이 있으면 GA4 기반 Looker Studio
 *    '공개' 리포트를 iframe 으로 임베드해 방문 통계를 누구나 볼 수 있게 표시.
 *  - 아직 URL 이 없으면 설정 안내를 보여준다(페이지는 그대로 배포 가능).
 * GitHub Pages(정적)에선 GA4 숫자를 직접 못 불러오므로 공개 표시는 Looker Studio 임베드로 처리.
 */
export default function Stats() {
  const url = site.analytics.lookerStudioEmbedUrl

  return (
    <div className="page stats-page">
      <Seo
        title="방문 통계"
        path="/stats"
        description={`${site.title}의 방문자 통계 — 방문 수·인기 글·유입 경로를 공개합니다.`}
      />
      <h1>방문 통계</h1>
      <p className="muted">
        이 블로그의 방문 데이터는 Google Analytics 4 로 집계되며, 아래 대시보드에 실시간으로 반영됩니다.
      </p>

      {url ? (
        <div className="stats-embed">
          <iframe
            src={url}
            title="방문 통계 대시보드 (Looker Studio)"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allowFullScreen
          />
        </div>
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
          <p>공개 방문 통계 대시보드를 아직 연결하지 않았어요. 아래 순서로 연결하면 이 자리에 표시됩니다.</p>
          <ol style={{ lineHeight: 1.9, paddingLeft: '1.2rem' }}>
            <li>
              <strong>Google Analytics 4</strong> 속성을 만들고 측정 ID(<code>G-XXXXXXXXXX</code>)를
              <code> src/site.config.ts</code> 의 <code>analytics.ga4</code> 에 입력
            </li>
            <li>
              <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer">
                Looker Studio
              </a>{' '}
              에서 해당 GA4 속성을 데이터 소스로 리포트 생성(원하는 지표: 방문 수·인기 글·유입 경로 등)
            </li>
            <li>리포트 → <strong>공유</strong> → “링크가 있는 모든 사용자에게 공개”로 설정</li>
            <li>
              리포트 상단 <strong>삽입</strong>(<code>&lt;/&gt;</code>) → 삽입 코드의 <code>iframe src</code>
              (임베드 URL)를 복사해 <code>analytics.lookerStudioEmbedUrl</code> 에 붙여넣고 재배포
            </li>
          </ol>
          <p className="muted" style={{ marginBottom: 0 }}>
            ※ 상세 통계는 소유자가 GA4 대시보드에서 언제든 확인할 수 있습니다.
          </p>
        </section>
      )}
    </div>
  )
}
