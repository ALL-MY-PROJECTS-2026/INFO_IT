import { useEffect, useState } from 'react'

type Theme = 'light' | 'sepia' | 'dark'

const ORDER: Theme[] = ['light', 'sepia', 'dark']
const LABEL: Record<Theme, string> = { light: '라이트', sepia: '보호', dark: '다크' }

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const cur = document.documentElement.dataset.theme as Theme
    setTheme(ORDER.includes(cur) ? cur : 'light')
    setMounted(true)
  }, [])

  function cycle() {
    // 현재 값은 DOM(data-theme)을 진실원본으로 읽어 연속 클릭에도 정확히 순환한다.
    const cur = (document.documentElement.dataset.theme as Theme) || theme
    const idx = ORDER.indexOf(cur)
    const next = ORDER[(idx + 1) % ORDER.length]
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* noop */
    }
  }

  const cur: Theme = mounted ? theme : 'light'
  const nextLabel = LABEL[ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]]

  return (
    <button
      className="theme-toggle"
      onClick={cycle}
      aria-label={`화면 테마: ${LABEL[cur]} — 누르면 ${nextLabel}`}
      title={`테마: ${LABEL[cur]} → ${nextLabel}`}
    >
      {cur === 'light' && (
        // 해 아이콘 — 라이트
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      )}
      {cur === 'sepia' && (
        // 눈 아이콘 — 보호(눈 편한 따뜻한 화면)
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
      {cur === 'dark' && (
        // 달 아이콘 — 다크
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
