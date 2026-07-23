/**
 * 날짜 표시.
 * - "YYYY-MM-DD"          → "2026년 7월 22일"
 * - "YYYY-MM-DDTHH:MM"    → "2026년 7월 22일 14:30" (시간이 있으면 HH:MM 함께)
 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const base = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  // 시간 성분("T14:30" 또는 " 14:30")이 있을 때만 HH:MM 을 덧붙인다.
  if (!/[T ]\d{2}:\d{2}/.test(iso)) return base
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${base} ${hh}:${mm}`
}

/** 한글/영문 혼합 텍스트의 예상 읽기 시간(분). 분당 약 500자 기준. */
export function readingMinutes(text: string): number {
  const chars = text.replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 500))
}
