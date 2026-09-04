import { durationFor, posterFor } from "./videoPosters"

const SITE = "https://madebyraz.co.il"

export type VideoFacts = {
  /** Site-absolute path of the clip, e.g. "/videos/ai-campaign-ad.mp4". */
  src: string
  name: string
  description: string
  /** ISO date the film was published. Google treats this as required. */
  uploadDate: string
  /** Site-absolute path of the page the video is the main content of. */
  pagePath: string
  /** Overrides the frame extracted by scripts/generate-video-posters.mjs. */
  poster?: string
}

// Google will not index a video it cannot describe: name, description,
// thumbnailUrl and uploadDate are all required, and a video with none of them
// shows up in Search Console as "found, not indexed" no matter how prominent
// it is on the page.
//
// Only worth attaching where the video genuinely is the page — a case study
// built around a film, not a muted loop running behind a headline. Google
// rejects the decorative ones under "video is not the main content", and it is
// right to: marking one up would be a claim that isn't true.
export function videoObjectJsonLd(facts: VideoFacts) {
  const thumbnail = facts.poster ?? posterFor(facts.src)
  const duration = durationFor(facts.src)

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: facts.name,
    description: facts.description,
    ...(thumbnail ? { thumbnailUrl: `${SITE}${thumbnail}` } : {}),
    uploadDate: facts.uploadDate,
    ...(duration ? { duration } : {}),
    contentUrl: `${SITE}${facts.src}`,
    // The page is where the film is watched, so it doubles as the embed
    // target: there is no separate player URL to point at.
    embedUrl: `${SITE}${facts.pagePath}`,
    creator: { "@type": "Person", name: "Raz Avramov", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "Made by RAZ",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/images/og-image.png` },
    },
  }
}
