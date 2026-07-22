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
  // 방문 통계(/stats) 접근 잠금 (배포 사이트에서 아이디/비밀번호 요구).
  //  ⚠️ 정적 호스팅(GitHub Pages)에는 서버가 없어 '완전한' 보안은 불가능합니다.
  //     이 게이트는 캐주얼한 열람을 막는 수준이며, 비밀번호는 평문 대신 SHA-256 해시로만 저장합니다.
  //  비밀번호 변경: node -e "const c=require('crypto');console.log(c.createHash('sha256').update('panco-stats-v1:'+'새비번').digest('hex'))"
  //     → 출력 해시를 passHash 에 붙여넣기.
  statsAuth: {
    enabled: true,
    user: 'admin',
    salt: 'panco-stats-v1:',
    passHash: '180a153e85eb4ba812f4b9d50555538e6a3f99d8caf20f6b5538c361a4d36e77',
  },
} as const

export type SiteConfig = typeof site
