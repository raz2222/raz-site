import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { ShowcaseNav } from "@/components/showcase/ShowcaseNav"
import { ShowcaseFooter } from "@/components/showcase/ShowcaseFooter"
import { ShowcaseHome } from "@/pages/showcase/ShowcaseHome"
import { ShowcaseWork } from "@/pages/showcase/ShowcaseWork"
import { ShowcaseCaseStudy } from "@/pages/showcase/ShowcaseCaseStudy"

// Judge-facing Awwwards submission build at show.madebyraz.co.il — the same
// hostname-branch pattern as WebLanding/AILanding (see App.tsx), rendered
// entirely outside the main site's <Routes> tree and without any of its
// sales chrome (no announcement bar, no WhatsApp button, no service
// dropdowns). The contact modal and cookie consent are provided by App.tsx,
// same as the web./ai. branches.
export function Showcase() {
  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  return (
    <div dir="ltr" className="text-left">
      <ShowcaseNav />
      <main>
        <Routes>
          <Route path="/" element={<ShowcaseHome />} />
          <Route path="/work" element={<ShowcaseWork />} />
          <Route path="/work/:slug" element={<ShowcaseCaseStudy />} />
        </Routes>
      </main>
      <ShowcaseFooter />
    </div>
  )
}
