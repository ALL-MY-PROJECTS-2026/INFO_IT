import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main" className="container">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
