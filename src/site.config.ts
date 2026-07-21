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
  // 애드센스 승인 후 본인 퍼블리셔 ID(ca-pub-XXXX)로 교체
  adsense: {
    client: 'ca-pub-XXXXXXXXXXXXXXXX',
    enabled: false, // 승인 후 true 로 변경
  },
  nav: [
    { label: '홈', to: '/' },
    { label: '전체 글', to: '/posts' },
    { label: '소개', to: '/about' },
    { label: '문의', to: '/contact' },
  ],
  // 왼쪽 사이드바 카테고리 (IT 주제별, 애드센스 지향). 라벨은 글 frontmatter 의 category 와 매칭됩니다.
  categories: [
    { label: '프론트엔드', desc: '웹사이트에서 눈에 보이는 화면을 만드는 기술' },
    { label: '백엔드', desc: '화면 뒤에서 정보를 처리하는 서버 이야기' },
    { label: '클라우드·데브옵스', desc: '만든 프로그램을 인터넷에 올리고 자동으로 관리하기' },
    { label: 'AI·머신러닝', desc: '컴퓨터가 스스로 배우게 하는 인공지능' },
    { label: 'CS 기초', desc: '컴퓨터가 움직이는 기본 원리' },
    { label: '데이터베이스', desc: '정보를 잘 저장하고 빠르게 찾는 방법' },
    { label: '보안', desc: '해킹을 막고 소중한 정보를 안전하게 지키기' },
    { label: '모바일', desc: '스마트폰 앱을 만드는 방법' },
    { label: '개발도구·생산성', desc: '개발을 더 편하고 빠르게 해주는 도구들' },
    { label: '커리어', desc: '개발자로 취업하고 성장하는 이야기' },
  ],
} as const

export type SiteConfig = typeof site
