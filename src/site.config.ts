/**
 * 사이트 전역 설정.
 *
 * 편집 대상 콘텐츠(제목·설명·저자·nav·카테고리)는 src/content/site.json 에 있으며,
 * 향후 localhost 관리자모드에서 이 JSON 을 CRUD 합니다.
 * 아래 기술 설정(verification·analytics·adsense)은 코드로만 관리합니다(관리자 편집 대상 아님).
 */
import content from './content/site.json'

export const site = {
  ...content,
  // 사이트 소유 확인용 인증 코드. 값을 채우면 <head> 에 자동 삽입됩니다.
  //  - google: Google Search Console 의 'HTML 태그' 방식 content 값
  //  - naver:  네이버 서치어드바이저 인증 코드(선택)
  verification: {
    google: '',
    naver: '',
  },
  // Google Analytics 4 + 방문 통계(/stats) 대시보드.
  analytics: {
    ga4: 'G-Z15X9WDPP7', // GA4 웹 스트림(MYWEBPROJECT-01) 측정 ID
    lookerStudioEmbedUrl:
      'https://lookerstudio.google.com/embed/reporting/3080199a-9c7b-4cf6-915c-91e4c10142b5/page/8fV4F',
  },
  // 애드센스 설정.
  //  1) 승인 신청 전: client 를 실제 ca-pub-XXXX 로 교체하고 review=true (심사 스크립트만 주입)
  //  2) 승인 후: enabled=true (실제 광고 노출)
  adsense: {
    client: 'ca-pub-XXXXXXXXXXXXXXXX',
    review: false,
    enabled: false,
  },
} as const

export type SiteConfig = typeof site
