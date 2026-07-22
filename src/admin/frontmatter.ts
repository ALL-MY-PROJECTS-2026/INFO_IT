// 아주 단순한 frontmatter 파서/직렬화 (관리자 글 편집용).
// 지원 타입: 문자열, boolean(true/false), 배열([a, b]).
export type Frontmatter = Record<string, string | boolean | string[]>

export function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!m) return { fm: {}, body: raw }
  const fm: Frontmatter = {}
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!mm) continue
    const key = mm[1]
    let v = mm[2].trim()
    if (v === 'true') fm[key] = true
    else if (v === 'false') fm[key] = false
    else if (/^\[.*\]$/.test(v))
      fm[key] = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    else fm[key] = v.replace(/^["']|["']$/g, '')
  }
  return { fm, body: m[2] }
}

export function stringifyFrontmatter(fm: Frontmatter, body: string): string {
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => (Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`))
  return `---\n${lines.join('\n')}\n---\n\n${body.replace(/^\n+/, '')}\n`
}
