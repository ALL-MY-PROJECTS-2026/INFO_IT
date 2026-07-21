import { useContext, useEffect } from 'react'
import { HeadCollectorContext, computeMeta, applyHead, type SeoProps } from '../lib/head'

/**
 * 페이지별 메타/OG/JSON-LD 선언.
 *  - SSR(프리렌더): Context 컬렉터에 메타를 수집 → entry-server 가 <head> 로 주입
 *  - CSR(SPA 이동): useEffect 로 document head 갱신
 * 외부 라이브러리 없이 동작(Node 24 안정성 확보).
 */
export default function Seo(props: SeoProps) {
  const meta = computeMeta(props)
  const collector = useContext(HeadCollectorContext)

  // SSR: 렌더 중 수집 (renderToString 은 동기라 이후 읽기 안전)
  if (collector) collector.current = meta

  useEffect(() => {
    applyHead(meta)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.url, meta.fullTitle])

  return null
}
