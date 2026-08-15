import { Routes, Route } from "react-router-dom"
import { Nav } from "@/components/Nav"
import { Footer } from "@/components/Footer"
import { Home } from "@/pages/Home"
import { WorkIndex } from "@/pages/WorkIndex"
import { CaseStudy } from "@/pages/CaseStudy"

function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<WorkIndex />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
