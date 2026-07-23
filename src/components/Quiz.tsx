import { useState } from 'react'

export interface QuizQuestion {
  /** 'ox' = O/X 문제, 'mc' = 4지선다 */
  type: 'ox' | 'mc'
  /** 질문 문장 */
  q: string
  /** (선택) 질문 위에 보여줄 코드 블록 — 빈칸 채우기 문제용 */
  code?: string
  /** mc 일 때 보기 목록 */
  options?: string[]
  /** 정답: ox 는 boolean(O=true), mc 는 정답 보기의 0-based 인덱스 */
  answer: boolean | number
  /** 정답 해설 */
  explain: string
}

/**
 * 포켓코딩 시리즈용 인터랙티브 퀴즈.
 * 클릭하기 전에는 정답이 보이지 않고, 답을 고르면 정답/오답 + 해설을 보여준다.
 */
export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | boolean | null>(null)
  const [done, setDone] = useState(false)

  if (!questions || questions.length === 0) return null
  const total = questions.length

  if (!started) {
    const oxN = questions.filter((x) => x.type === 'ox').length
    const mcN = total - oxN
    const parts = [oxN ? `OX ${oxN}문제` : '', mcN ? `4지선다 ${mcN}문제` : ''].filter(Boolean)
    return (
      <div className="quiz">
        <div className="quiz__start">
          <h3 className="quiz__h">미니 퀴즈</h3>
          <p className="quiz__meta">{parts.join(' + ')}</p>
          <button className="quiz__btn" onClick={() => setStarted(true)}>
            시작하기
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    const msg =
      score === total
        ? '완벽합니다. 핵심을 정확히 잡으셨습니다.'
        : score >= Math.ceil(total / 2)
          ? '좋습니다. 틀린 부분만 다시 보면 됩니다.'
          : '괜찮습니다. 위 내용을 한 번 더 읽고 도전해 보세요.'
    return (
      <div className="quiz">
        <div className="quiz__result">
          <h3 className="quiz__h">
            {total}문제 중 <span className="quiz__score">{score}개</span> 정답
          </h3>
          <p className="quiz__meta">{msg}</p>
          <button
            className="quiz__btn"
            onClick={() => {
              setStarted(false)
              setI(0)
              setScore(0)
              setPicked(null)
              setDone(false)
            }}
          >
            다시 풀기
          </button>
        </div>
      </div>
    )
  }

  const cur = questions[i]
  const answered = picked !== null

  function choose(val: number | boolean) {
    if (answered) return
    setPicked(val)
    if (val === cur.answer) setScore((s) => s + 1)
  }
  function next() {
    if (i < total - 1) {
      setI(i + 1)
      setPicked(null)
    } else {
      setDone(true)
    }
  }

  const isCorrect = picked === cur.answer
  const oxCells: [string, boolean][] = [
    ['O', true],
    ['X', false],
  ]

  return (
    <div className="quiz">
      <div className="quiz__nav">
        <span className="quiz__count">
          {i + 1} / {total}
        </span>
        <span className="quiz__kind">{cur.type === 'ox' ? 'OX' : '4지선다'}</span>
      </div>
      <p className="quiz__q">{cur.q}</p>
      {cur.code && (
        <pre className="quiz__code">
          <code>{cur.code}</code>
        </pre>
      )}

      {cur.type === 'ox' ? (
        <div className="quiz__ox">
          {oxCells.map(([label, val]) => {
            const cls = answered
              ? val === cur.answer
                ? 'is-correct'
                : picked === val
                  ? 'is-wrong'
                  : ''
              : ''
            return (
              <button
                key={label}
                className={`quiz__opt quiz__opt--ox ${cls}`}
                disabled={answered}
                onClick={() => choose(val)}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="quiz__opts">
          {(cur.options ?? []).map((opt, idx) => {
            const cls = answered
              ? idx === cur.answer
                ? 'is-correct'
                : picked === idx
                  ? 'is-wrong'
                  : ''
              : ''
            return (
              <button
                key={idx}
                className={`quiz__opt ${cls}`}
                disabled={answered}
                onClick={() => choose(idx)}
              >
                {idx + 1}. {opt}
              </button>
            )
          })}
        </div>
      )}

      {answered && (
        <div className="quiz__explain">
          <strong className={isCorrect ? 'ok' : 'no'}>{isCorrect ? '정답' : '오답'}</strong>{' '}
          {cur.explain}
        </div>
      )}
      {answered && (
        <button className="quiz__btn" onClick={next}>
          {i < total - 1 ? '다음' : '결과 보기'}
        </button>
      )}
    </div>
  )
}
