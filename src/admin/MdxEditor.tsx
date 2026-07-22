import { useRef, useState, type ChangeEvent } from 'react'
import { adminApi } from './api'

/**
 * 툴바가 달린 MDX/마크다운 에디터.
 *  - 🖼️ 이미지: 파일 업로드 → public/uploads 저장 → 커서 위치에 ![](경로) 삽입
 *  - 🔗 링크: [텍스트](url) 삽입
 *  - 굵게 / 소제목 빠른 삽입
 */
export default function MdxEditor({
  value,
  onChange,
  rows = 16,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')

  function insert(text: string, cursorInside?: [number, number]) {
    const el = ta.current
    const start = el ? el.selectionStart : value.length
    const end = el ? el.selectionEnd : value.length
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const a = start + (cursorInside ? cursorInside[0] : text.length)
      const b = start + (cursorInside ? cursorInside[1] : text.length)
      el.setSelectionRange(a, b)
    })
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setStatus(`업로드 중… (${file.name})`)
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(String(r.result))
        r.onerror = () => rej(new Error('파일 읽기 실패'))
        r.readAsDataURL(file)
      })
      const { path } = await adminApi.uploadMedia(file.name, dataUrl)
      const alt = file.name.replace(/\.[^.]+$/, '')
      insert(`\n\n![${alt}](${path})\n\n`)
      setStatus('✅ 이미지 삽입됨: ' + path)
    } catch (err) {
      setStatus('❌ ' + (err as Error).message)
    }
  }

  function addLink() {
    const el = ta.current
    const selected = el ? value.slice(el.selectionStart, el.selectionEnd) : ''
    const url = window.prompt('링크 주소 (예: https://example.com 또는 /posts/글주소)')
    if (!url) return
    const text = selected || window.prompt('링크에 표시할 글자', '링크') || '링크'
    insert(`[${text}](${url})`)
  }

  return (
    <div className="mdx-editor">
      <div className="mdx-editor__bar">
        <button type="button" onClick={() => fileRef.current?.click()}>
          🖼️ 이미지 업로드
        </button>
        <button type="button" onClick={addLink}>
          🔗 링크
        </button>
        <button type="button" onClick={() => insert('**굵게**', [2, 4])}>
          <b>B</b>
        </button>
        <button type="button" onClick={() => insert('\n## 소제목\n', [4, 7])}>
          H2
        </button>
        {status && <span className="muted mdx-editor__status">{status}</span>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      <textarea
        ref={ta}
        className="admin__mdx"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="muted" style={{ fontSize: '.8rem', marginTop: '.4rem' }}>
        이미지는 <code>public/uploads/</code> 에 저장됩니다. 저장 후 <b>git add · commit · push</b> 하면 라이브에 함께 올라갑니다.
      </p>
    </div>
  )
}
