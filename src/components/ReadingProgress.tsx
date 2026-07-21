import { useEffect, useState } from 'react'

/** 상단 고정 읽기 진행바 (스크롤 %, requestAnimationFrame 스로틀) */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      const value = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0
      setPct(value)
      raf = 0
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div className="reading-progress" style={{ width: `${pct}%` }} aria-hidden="true" />
}
