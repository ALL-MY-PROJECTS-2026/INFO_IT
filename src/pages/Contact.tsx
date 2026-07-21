import Seo from '../components/Seo'
import { site } from '../site.config'

export default function Contact() {
  return (
    <div className="page">
      <Seo title="문의" path="/contact" description={`${site.title}에 문의하기`} />
      <h1>문의</h1>
      <p>
        글에 대한 질문, 오류 제보, 제휴·협업 문의는 아래 이메일로 연락해 주세요. 확인 후 최대한
        빠르게 답변드리겠습니다.
      </p>

      <h2>이메일</h2>
      <p>
        <a href={`mailto:${site.author.email}`}>{site.author.email}</a>
      </p>

      <p className="muted" style={{ marginTop: '2rem' }}>
        ※ 스팸 방지를 위해 문의 폼 대신 이메일을 사용합니다.
      </p>
    </div>
  )
}
