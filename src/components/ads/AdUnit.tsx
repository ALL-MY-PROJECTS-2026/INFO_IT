import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../../site.config'

/**
 * AdSense 광고 슬롯 캡슐화 컴포넌트.
 *
 * 리서치 반영(SPA + AdSense 함정 방지):
 *  - 각 <ins>는 라우트 변경 시 key 로 언마운트/리마운트되어 "already have ads" 오류 방지
 *  - push({}) 는 <ins> DOM 렌더 이후(useEffect)에 1회만 호출
 *  - site.config 의 adsense.enabled 가 false 면 자리표시자만 표시(개발/승인 전)
 *  - 인위적 리프레시는 하지 않음(실제 라우트 변경 시에만 로드)
 */
export default function AdUnit({ slot, format = 'auto' }: { slot?: string; format?: string }) {
  const location = useLocation()
  // 라우트 경로를 key 로 사용해 페이지 이동마다 새 DOM 에만 push
  return <AdInner key={location.pathname + (slot ?? '')} slot={slot} format={format} />
}

function AdInner({ slot, format }: { slot?: string; format: string }) {
  const insRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    if (!site.adsense.enabled) return
    const el = insRef.current
    if (!el || el.getAttribute('data-adsbygoogle-status')) return
    try {
      // @ts-expect-error adsbygoogle 는 외부 스크립트에서 주입됨
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* 광고 차단기/스크립트 미로드 시 무시 */
    }
  }, [])

  if (!site.adsense.enabled) {
    // 승인 전에는 아무것도 노출하지 않음
    return null
  }

  return (
    <div className="ad-slot" aria-hidden="true">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={site.adsense.client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
