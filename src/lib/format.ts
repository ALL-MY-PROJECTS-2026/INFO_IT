/** YYYY-MM-DD → "2026년 7월 22일" */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

/** 한글/영문 혼합 텍스트의 예상 읽기 시간(분). 분당 약 500자 기준. */
export function readingMinutes(text: string): number {
  const chars = text.replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 500))
}
