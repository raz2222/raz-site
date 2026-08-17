import { Suspense, lazy, useState } from "react"
import { Routes, Route } from "react-router-dom"
import { Nav } from "@/components/Nav"
import { Footer } from "@/components/Footer"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { MobileStickyBar } from "@/components/MobileStickyBar"
import { ScrollToTop } from "@/components/ScrollToTop"
import { WhatsAppMessageContext } from "@/hooks/useWhatsAppMessage"
import { Home } from "@/pages/Home"
import { useAuth } from "@/hooks/useAuth"

const WorkIndex = lazy(() => import("@/pages/WorkIndex").then((m) => ({ default: m.WorkIndex })))
const CaseStudy = lazy(() => import("@/pages/CaseStudy").then((m) => ({ default: m.CaseStudy })))
const Faq = lazy(() => import("@/pages/Faq").then((m) => ({ default: m.Faq })))
const GuidesIndex = lazy(() => import("@/pages/GuidesIndex").then((m) => ({ default: m.GuidesIndex })))
const GuideArticle = lazy(() => import("@/pages/GuideArticle").then((m) => ({ default: m.GuideArticle })))
const Services = lazy(() => import("@/pages/Services").then((m) => ({ default: m.Services })))
const WebDesignHub = lazy(() => import("@/pages/hubs/WebDesignHub").then((m) => ({ default: m.WebDesignHub })))
const AIContentHub = lazy(() => import("@/pages/hubs/AIContentHub").then((m) => ({ default: m.AIContentHub })))
const SubServicePage = lazy(() => import("@/pages/SubServicePage").then((m) => ({ default: m.SubServicePage })))
const AboutPage = lazy(() => import("@/pages/About").then((m) => ({ default: m.About })))
const Contact = lazy(() => import("@/pages/Contact").then((m) => ({ default: m.Contact })))
const Privacy = lazy(() => import("@/pages/Privacy").then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => import("@/pages/Terms").then((m) => ({ default: m.Terms })))
const ThankYou = lazy(() => import("@/pages/ThankYou").then((m) => ({ default: m.ThankYou })))
const EnglishThankYou = lazy(() => import("@/pages/EnglishThankYou").then((m) => ({ default: m.EnglishThankYou })))
const Tools = lazy(() => import("@/pages/Tools").then((m) => ({ default: m.Tools })))
const English = lazy(() => import("@/pages/English").then((m) => ({ default: m.English })))
const EnglishServices = lazy(() => import("@/pages/EnglishServices").then((m) => ({ default: m.EnglishServices })))
const EnglishContact = lazy(() => import("@/pages/EnglishContact").then((m) => ({ default: m.EnglishContact })))
const EnglishFaq = lazy(() => import("@/pages/EnglishFaq").then((m) => ({ default: m.EnglishFaq })))
const EnglishAbout = lazy(() => import("@/pages/EnglishAbout").then((m) => ({ default: m.EnglishAbout })))
const EnglishWorkIndex = lazy(() => import("@/pages/EnglishWorkIndex").then((m) => ({ default: m.EnglishWorkIndex })))
const EnglishCaseStudy = lazy(() => import("@/pages/EnglishCaseStudy").then((m) => ({ default: m.EnglishCaseStudy })))
const EnglishGuidesIndex = lazy(() => import("@/pages/EnglishGuidesIndex").then((m) => ({ default: m.EnglishGuidesIndex })))
const EnglishGuideArticle = lazy(() => import("@/pages/EnglishGuideArticle").then((m) => ({ default: m.EnglishGuideArticle })))
const AdminLogin = lazy(() => import("@/pages/AdminLogin").then((m) => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })))
const AdminServices = lazy(() => import("@/pages/admin/AdminServices").then((m) => ({ default: m.AdminServices })))
const AdminGuides = lazy(() => import("@/pages/admin/AdminGuides").then((m) => ({ default: m.AdminGuides })))
const AdminFaq = lazy(() => import("@/pages/admin/AdminFaq").then((m) => ({ default: m.AdminFaq })))
const AdminClients = lazy(() => import("@/pages/admin/AdminClients").then((m) => ({ default: m.AdminClients })))
const AdminPages = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.AdminPages })))
const WebLanding = lazy(() => import("@/pages/landing/WebLanding").then((m) => ({ default: m.WebLanding })))
const AILanding = lazy(() => import("@/pages/landing/AILanding").then((m) => ({ default: m.AILanding })))
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })))
const Portal = lazy(() => import("@/pages/Portal").then((m) => ({ default: m.Portal })))
const QuoteView = lazy(() => import("@/pages/portal/QuoteView").then((m) => ({ default: m.QuoteView })))

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
      <div className="h-16 md:hidden" aria-hidden="true" />
      <WhatsAppButton />
      <MobileStickyBar />
    </>
  )
}

function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <AdminDashboard /> : <AdminLogin />
}

const hostname = typeof window !== "undefined" ? window.location.hostname : ""

function App() {
  const [waMessage, setWaMessage] = useState<string | undefined>(undefined)

  if (hostname.startsWith("web.")) {
    return (
      <Suspense fallback={null}>
        <WebLanding />
      </Suspense>
    )
  }

  if (hostname.startsWith("ai.")) {
    return (
      <Suspense fallback={null}>
        <AILanding />
      </Suspense>
    )
  }

  return (
    <WhatsAppMessageContext.Provider value={{ message: waMessage, setMessage: setWaMessage }}>
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
      <Route path="/services/web-design" element={<PublicLayout><WebDesignHub /></PublicLayout>} />
      <Route path="/services/ai-content" element={<PublicLayout><AIContentHub /></PublicLayout>} />
      <Route path="/services/:hubSlug/:subSlug" element={<PublicLayout><SubServicePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/thank-you" element={<PublicLayout><ThankYou /></PublicLayout>} />
      <Route path="/en/thank-you" element={<PublicLayout><EnglishThankYou /></PublicLayout>} />
      <Route path="/tools" element={<PublicLayout><Tools /></PublicLayout>} />
      <Route path="/en" element={<PublicLayout><English /></PublicLayout>} />
      <Route path="/en/services" element={<PublicLayout><EnglishServices /></PublicLayout>} />
      <Route path="/en/contact" element={<PublicLayout><EnglishContact /></PublicLayout>} />
      <Route path="/en/faq" element={<PublicLayout><EnglishFaq /></PublicLayout>} />
      <Route path="/en/about" element={<PublicLayout><EnglishAbout /></PublicLayout>} />
      <Route path="/en/work" element={<PublicLayout><EnglishWorkIndex /></PublicLayout>} />
      <Route path="/en/work/:slug" element={<PublicLayout><EnglishCaseStudy /></PublicLayout>} />
      <Route path="/en/guides" element={<PublicLayout><EnglishGuidesIndex /></PublicLayout>} />
      <Route path="/en/guides/:slug" element={<PublicLayout><EnglishGuideArticle /></PublicLayout>} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="/admin/clients" element={<AdminClients />} />
      <Route path="/admin/services" element={<AdminServices />} />
      <Route path="/admin/guides" element={<AdminGuides />} />
      <Route path="/admin/faq" element={<AdminFaq />} />
      <Route path="/admin/pages" element={<AdminPages />} />
      <Route path="/portal" element={<Portal />} />
      <Route path="/portal/quote/:id" element={<QuoteView />} />
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
    </Suspense>
    </WhatsAppMessageContext.Provider>
  )
}

export default App
