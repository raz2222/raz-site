import { Routes, Route } from "react-router-dom"
import { Nav } from "@/components/Nav"
import { Footer } from "@/components/Footer"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { Home } from "@/pages/Home"
import { WorkIndex } from "@/pages/WorkIndex"
import { CaseStudy } from "@/pages/CaseStudy"
import { Faq } from "@/pages/Faq"
import { GuidesIndex } from "@/pages/GuidesIndex"
import { GuideArticle } from "@/pages/GuideArticle"
import { Services } from "@/pages/Services"
import { About as AboutPage } from "@/pages/About"
import { Contact } from "@/pages/Contact"
import { AdminLogin } from "@/pages/AdminLogin"
import { AdminDashboard } from "@/pages/AdminDashboard"
import { useAuth } from "@/hooks/useAuth"

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <AdminDashboard /> : <AdminLogin />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/work" element={<PublicLayout><WorkIndex /></PublicLayout>} />
      <Route path="/work/:slug" element={<PublicLayout><CaseStudy /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><Faq /></PublicLayout>} />
      <Route path="/guides" element={<PublicLayout><GuidesIndex /></PublicLayout>} />
      <Route path="/guides/:slug" element={<PublicLayout><GuideArticle /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/admin" element={<AdminRoute />} />
    </Routes>
  )
}

export default App
