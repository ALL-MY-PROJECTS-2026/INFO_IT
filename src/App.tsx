import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import Category from './pages/Category'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Stats from './pages/Stats'
import NotFound from './pages/NotFound'

// 관리자 패널: localhost(dev)에서만 로드. 프로덕션 빌드에선 이 chunk 자체가 제외됨.
const AdminPanel = import.meta.env.DEV ? lazy(() => import('./admin/Admin')) : null

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts" element={<PostList />} />
        <Route path="posts/:slug" element={<PostDetail />} />
        <Route path="category/:name" element={<Category />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="stats" element={<Stats />} />
        {import.meta.env.DEV && AdminPanel && (
          <Route
            path="admin"
            element={
              <Suspense fallback={<div className="container" style={{ padding: '2rem' }}>관리자 로딩…</div>}>
                <AdminPanel />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
