import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// GitHub Pages 하위 경로(/INFO_IT/) 대응: Vite base 를 라우터 basename 으로 사용
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const root = document.getElementById('root')!
const app = (
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
)

// 프리렌더된 HTML(프로덕션)이 있으면 hydrate, dev(빈 root)에서는 createRoot 로 렌더
if (root.firstElementChild) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
