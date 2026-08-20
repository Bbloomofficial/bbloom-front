import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Services from './pages/Services'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// The staff admin area is a separate audience from the marketing site, so
// visitors to either only download the half they need.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-canvas" />}>{children}</Suspense>
}

function MarketingApp() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work" element={<Navigate to="/services" replace />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Lazy>
            <AdminApp />
          </Lazy>
        }
      />
      <Route path="*" element={<MarketingApp />} />
    </Routes>
  )
}
