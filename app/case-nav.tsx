'use client'

// The contents of a case study, and the reader's place in it.
//
// On a wide screen this is the sticky rail docked to the page's left margin.
// Under 768px the stylesheet turns it into a bar pinned beneath the site nav
// that scrolls sideways, which is the only reason the scrolling below exists:
// the section you are in can sit off the end of a bar you cannot see all of.

import { useEffect, useRef, useState } from 'react'

export type Section = {
  id: string
  label: string
}

export default function CaseNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0].id)
  const rail = useRef<HTMLElement>(null)

  // Highlight whichever section is sitting in the upper third of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  // Keep the current section on screen — inside the bar only. Scrolling the
  // page here would take the reader somewhere they did not ask to go, so this
  // does nothing at all on the desktop rail, which never overflows.
  useEffect(() => {
    const el = rail.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const link = el.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`)
    if (!link) return
    const centred = link.offsetLeft - (el.clientWidth - link.offsetWidth) / 2
    el.scrollTo({
      left: Math.max(0, Math.min(centred, el.scrollWidth - el.clientWidth)),
      behavior: 'smooth',
    })
  }, [active])

  return (
    <aside className="case-nav" ref={rail}>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={active === section.id ? 'is-active' : undefined}
          aria-current={active === section.id ? 'true' : undefined}
        >
          {section.label}
        </a>
      ))}
    </aside>
  )
}
