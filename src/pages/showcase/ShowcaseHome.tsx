import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { ShowcaseHero } from "@/pages/showcase/ShowcaseHero"
import {
  EnglishExperiments,
  EnglishPositioning,
  EnglishSelectedWork,
  EnglishFeaturedCaseStudy,
  EnglishProcess,
  EnglishAbout,
} from "@/pages/English"

// The judge-facing single-page showcase: the same sections and media as the
// main English homepage, minus every sales-toned section (gift offer,
// pricing pillars, testimonials, modernization pitch, FAQ, final CTA), with
// the hero and AI talent/product picker fused into one flow (ShowcaseHero)
// instead of two stacked sections, and internal links pointed at this
// subdomain's own /work routes instead of the main site's /en/work.
export function ShowcaseHome() {
  useDocumentMeta(
    "RAZ — Creative Developer",
    "Selected work by Raz Avramov: websites and AI-powered creative for brands that want to stand out."
  )

  return (
    <>
      <ShowcaseHero />
      <EnglishExperiments ctaTo="/work" />
      <EnglishPositioning />
      <EnglishSelectedWork workBasePath="/work" />
      <EnglishFeaturedCaseStudy workBasePath="/work" />
      <EnglishProcess />
      <EnglishAbout showAboutLink={false} />
    </>
  )
}
