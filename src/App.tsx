import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Drawers } from '@/components/Drawers'
import { QuickView } from '@/components/QuickView'
import { Toast } from '@/components/Toast'
import { MotionLayer } from '@/components/Motion'
import { HomePage } from '@/pages/Home'
import { ShopPage } from '@/pages/Shop'
import { ProductPage } from '@/pages/ProductDetails'
import { CheckoutPage } from '@/pages/Checkout'
import { NotFoundPage } from '@/pages/NotFound'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollToTop />
      <Navbar />
      <main className="page-enter flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Drawers />
      <QuickView />
      <Toast />
      <MotionLayer />
    </div>
  )
}
