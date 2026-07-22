/**
 * 사이트 전역 설정. 배포 전 siteUrl 과 저자 정보를 실제 값으로 교체하세요.
 */
export const site = {
  title: 'PANCO_IT',
  description: '어려운 IT를 초·중·고 누구나 이해할 수 있게, 그림과 비유로 쉽고 친근하게 풀어주는 블로그예요. 하나씩 차근차근 같이 배워요!',
  // 배포 도메인 (끝에 슬래시 없이). 애드센스/SEO/사이트맵에 사용됩니다.
  // GitHub Pages 프로젝트 페이지 URL (커스텀 도메인 연결 시 교체).
  siteUrl: 'https://all-my-projects-2026.github.io/INFO_IT',
  author: {
    name: 'Jungwoo',
    bio: 'IT 지식을 정리하는 개발자',
    email: 'jwg135790@gmail.com',
  },
  locale: 'ko_KR',
  // 사이트 소유 확인용 인증 코드. 값을 채우면 <head> 에 자동 삽입됩니다.
  //  - google: Google Search Console 의 'HTML 태그' 방식 content 값만 입력
  //    (예: 'AbCdEf...'). 색인·SEO·애드센스 심사에 도움이 됩니다.
  //  - naver:  네이버 서치어드바이저 인증 코드(선택).
  verification: {
    google: '',
    naver: '',
  },
  // 애드센스 설정.
  //  1) 승인 신청 전: client 를 실제 ca-pub-XXXX 로 교체하고 review=true 로 두면
  //     심사용 애드센스 로더 스크립트가 <head> 에 삽입됩니다(광고는 아직 미노출).
  //  2) 승인 후: enabled=true 로 바꾸면 실제 광고 슬롯이 노출됩니다.
  adsense: {
    client: 'ca-pub-XXXXXXXXXXXXXXXX',
    review: false, // 승인 신청 직전 true (심사 스크립트만 주입, 광고 미노출)
    enabled: false, // 승인 후 true (실제 광고 노출)
  },
  nav: [
    { label: '홈', to: '/' },
    { label: '전체 글', to: '/posts' },
    { label: '소개', to: '/about' },
    { label: '문의', to: '/contact' },
  ],
  // 왼쪽 사이드바 카테고리. 라벨은 글 frontmatter 의 category 와 매칭됩니다.
  // 애드센스 전략: 주제를 넓히기보다 소수의 카테고리에 깊이를 쌓는 편이 승인에 유리.
  // 실제 글이 있는 카테고리만 사이드바/사이트맵에 노출됩니다(빈 카테고리 자동 숨김).
  categories: [
    { label: '웹 개발', desc: '웹사이트를 만드는 프론트엔드·백엔드 기술' },
    { label: '웹 성능·SEO', desc: '빠르고 검색에 잘 노출되는 사이트 만들기' },
    { label: '클라우드·인프라', desc: '만든 서비스를 배포하고 운영·자동화하기' },
    { label: 'CS 기초', desc: '컴퓨터가 동작하는 기본 원리와 개발 상식' },
  ],
} as const

export type SiteConfig = typeof site
