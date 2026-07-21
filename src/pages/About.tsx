import Seo from '../components/Seo'
import { site } from '../site.config'

export default function About() {
  return (
    <div className="page">
      <Seo title="소개" path="/about" description={`${site.title} 블로그와 저자 소개`} />
      <h1>소개</h1>
      <p>
        <strong>{site.title}</strong>는 개발·인프라·컴퓨터 과학 등 IT 지식을 실무 경험과 함께
        정리하는 기술 블로그입니다. 단순 정보 나열이 아니라, 직접 부딪히며 배운 내용을 코드와 예시로
        기록하는 것을 목표로 합니다.
      </p>

      <h2>다루는 주제</h2>
      <ul>
        <li>웹 프론트엔드 / 백엔드 개발</li>
        <li>클라우드·인프라·DevOps</li>
        <li>컴퓨터 과학 기초 (자료구조·알고리즘·네트워크)</li>
        <li>개발 도구와 생산성</li>
      </ul>

      <h2>저자</h2>
      <p>
        {site.author.name} — {site.author.bio}. 콘텐츠에 대한 피드백이나 오류 제보는 언제나
        환영합니다.
      </p>
      <p className="muted">문의: {site.author.email}</p>
    </div>
  )
}
