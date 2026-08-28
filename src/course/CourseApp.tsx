import { Routes, Route, Link } from "react-router-dom"
import { ScrollToTop } from "@/components/ScrollToTop"
import { CourseNav } from "./components/CourseNav"
import { CourseFooter } from "./components/CourseFooter"
import { CourseHome } from "./pages/CourseHome"
import { CourseLesson } from "./pages/CourseLesson"
import { CourseCheckout } from "./pages/CourseCheckout"
import { CourseLogin } from "./pages/CourseLogin"
import { CourseSignup } from "./pages/CourseSignup"
import { CourseAccount } from "./pages/CourseAccount"

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <CourseNav />
      <main>{children}</main>
      <CourseFooter />
    </div>
  )
}

function CourseNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 md:px-8">
      <h1 className="font-display text-2xl font-bold">הדף לא נמצא</h1>
      <Link to="/" className="mt-4 inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4">
        ← לעמוד הקורס
      </Link>
    </div>
  )
}

/** Everything under course.madebyraz.co.il. Mounted from src/App.tsx by hostname. */
export function CourseApp() {
  return (
    <>
      <ScrollToTop />
      <Shell>
        <Routes>
          <Route path="/" element={<CourseHome />} />
          <Route path="/lesson/:slug" element={<CourseLesson />} />
          <Route path="/checkout" element={<CourseCheckout />} />
          <Route path="/login" element={<CourseLogin />} />
          <Route path="/signup" element={<CourseSignup />} />
          <Route path="/account" element={<CourseAccount />} />
          <Route path="*" element={<CourseNotFound />} />
        </Routes>
      </Shell>
    </>
  )
}
