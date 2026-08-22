// app/about/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CMU, EMAIL, GARMIN, LINKEDIN, RED_HOUSE, RESUME } from '../links'

// public/profile.jpg is 1400x2100. The portrait keeps the text column's height,
// so its width has to follow from that to show the whole frame uncropped.
const PORTRAIT_RATIO = 1400 / 2100
const STACK_BREAKPOINT = 768

const links = [
  { label: 'RESUME', href: RESUME },
  { label: 'LINKEDIN', href: LINKEDIN },
  { label: 'EMAIL ME', href: EMAIL },
]

const pastimes = ['BAKING SWEETS', 'PLAYING THE PIANO', 'MAKING GLASS ANIMALS']

const facts = [
  { text: 'PRODUCT DESIGNER II ', mention: '@GARMIN', href: GARMIN },
  { text: 'BASED IN OLATHE, KS' },
  { text: 'BACHELOR OF DESIGN + HCI ', mention: '@CARNEGIE MELLON UNIVERSITY', href: CMU },
  { text: 'PREVIOUSLY DESIGNING ', mention: '@RED HOUSE COMMUNICATIONS', href: RED_HOUSE },
]

export default function About() {
  const text = useRef<HTMLDivElement>(null)
  const [portraitWidth, setPortraitWidth] = useState<number | null>(null)

  // Track the text column's height and size the portrait to match it.
  useEffect(() => {
    const el = text.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (window.innerWidth <= STACK_BREAKPOINT) {
        setPortraitWidth(null)
        return
      }
      const next = Math.round(entry.contentRect.height * PORTRAIT_RATIO)
      // ignore sub-pixel churn so this can't ping-pong with the flex layout
      setPortraitWidth((current) => (current && Math.abs(current - next) < 2 ? current : next))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <main className="main">
      {/* Nav */}
      <nav className="nav">
        <Link href="/" className="nav-name">YUER ZHU</Link>
        <div className="nav-links">
          <Link href="/">WORK</Link>
          <Link href="/play">PLAY</Link>
          <Link href="/about" className="is-active">ABOUT</Link>
        </div>
      </nav>

      <section className="about">
        <div className="about-row">
          <div className="about-text" ref={text}>
            <div className="about-links">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="about-link"
                  {...(link.href.startsWith('mailto:')
                    ? {}
                    : { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="about-extra about-list">
              {facts.map((fact) => (
                <div className="meta-item" key={fact.text}>
                  <span className="meta-icon">⊙</span>
                  <span>
                    {fact.text}
                    {fact.mention && (
                      <a
                        className="link"
                        href={fact.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {fact.mention}
                      </a>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="about-portrait"
            style={portraitWidth ? { width: portraitWidth } : undefined}
          >
            <Image
              src="/profile.jpg"
              alt="Yuer Zhu"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 30vw"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className="about-side">
            <p className="about-lead">OUTSIDE OF DESIGN, I&apos;M...</p>
            <div className="about-list">
              {pastimes.map((pastime) => (
                <div className="meta-item" key={pastime}>
                  <span className="meta-icon">⊙</span>
                  <span>{pastime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
