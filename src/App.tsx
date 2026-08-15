import { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { Nav } from "@/components/Nav"
import { Footer } from "@/components/Footer"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { ScrollToTop } from "@/components/ScrollToTop"
import { Home } from "@/pages/Home"
import { useAuth } from "@/hooks/useAuth"

const WorkIndex = lazy(() => import("@/pages/WorkIndex").then((m) => ({ default: m.WorkIndex })))
const CaseStudy = lazy(() => import("@/pages/CaseStudy").then((m) => ({ default: m.CaseStudy })))
const Faq = lazy(() => import("@/pages/Faq").then((m) => ({ default: m.Faq })))
const GuidesIndex = lazy(() => import("@/pages/GuidesIndex").then((m) => ({ default: m.GuidesIndex })))
const GuideArticle = lazy(() => import("@/pages/GuideArticle").then((m) => ({ default: m.GuideArticle })))
const Services = lazy(() => import("@/pages/Services").then((m) => ({ default: m.Services })))
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail").then((m) => ({ default: m.ServiceDetail })))
const AboutPage = lazy(() => import("@/pages/About").then((m) => ({ default: m.About })))
const Contact = lazy(() => import("@/pages/Contact").then((m) => ({ default: m.Contact })))
const Privacy = lazy(() => import("@/pages/Privacy").then((m) => ({ default: m.Privacy })))
const English = lazy(() => import("@/pages/English").then((m) => ({ default: m.English })))
const AdminLogin = lazy(() => import("@/pages/AdminLogin").then((m) => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })))

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 focus:rounded font-mono text-xs uppercase"
      >
        דלג לתוכן
      </a>
      <Nav />
      <main id="main">{children}</main>
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
    <>
    <ScrollToTop />
    <Suspense fallback={null}>
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/work" element={<PublicLayout><WorkIndex /></PublicLayout>} />
      <Route path="/work/:slug" element={<PublicLayout><CaseStudy /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><Faq /></PublicLayout>} />
      <Route path="/guides" element={<PublicLayout><GuidesIndex /></PublicLayout>} />
      <Route path="/guides/:slug" element={<PublicLayout><GuideArticle /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/services/:slug" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
      <Route path="/en" element={<PublicLayout><English /></PublicLayout>} />
      <Route path="/admin" element={<AdminRoute />} />
    </Routes>
    </Suspense>
    </>
  )
}

export default App
