import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"

export type Crumb = { label: string; to?: string }

const SITE = "https://madebyraz.co.il"

export function Breadcrumbs({ items, className = "mb-4" }: { items: Crumb[]; className?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.to ? { item: `${SITE}${item.to}` } : {}),
    })),
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <Reveal className={`font-mono text-xs uppercase tracking-wide text-dim ${className}`}>
        {items.map((item, i) => (
          <span key={item.label}>
            {item.to ? (
              <Link to={item.to} className="hover:text-[#D1FE17] transition-colors">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
            {i < items.length - 1 && " / "}
          </span>
        ))}
      </Reveal>
    </>
  )
}
