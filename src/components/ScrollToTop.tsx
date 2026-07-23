import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * SPA 라우트(경로) 변경 시 페이지 상단으로 스크롤한다.
 * 예: 글 하단의 '관련 글'을 클릭하면 새 글의 맨 위에서 시작.
 * - pathname 변경에만 반응하므로 같은 글 내 목차(#앵커) 이동은 방해하지 않는다.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // behavior:'instant' 로 즉시 점프. ('auto' 는 CSS scroll-behavior:smooth 를
    // 따라가 새 글이 중간에서 위로 스크롤되는 어색한 애니메이션이 생긴다.)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
