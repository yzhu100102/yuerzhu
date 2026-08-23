// app/about/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ScrollReveal from '../scroll-reveal'
import { EMAIL, LINKEDIN, RESUME } from '../links'

// Matches --nav-height in globals.css. The header has to know where its own
// underside is to take the colours of whichever screen has reached it.
const NAV_HEIGHT = 48

// ── Screen one ──
// A picture far taller than the window, scrolling with the page and changing
// over once as the second paragraph arrives. Swap in real photographs.
const STAGE = [
  { src: '/about/stage-1.png', alt: 'Yuer at her desk' },
  { src: '/about/stage-2.png', alt: 'Sketching a layout by hand' },
]

// ── Screen two ──
// The story reads as one sentence; the words carrying a picture light the frame
// beside them when pointed at, tapped or tabbed to. A plain string is just
// text, an object is a word with a photograph behind it.
type Part = string | { word: string; src: string; alt: string }

const STORY: Part[] = [
  'Baker of ',
  { word: 'sourdough', src: '/about/story-1.png', alt: 'A loaf of sourdough, scored and baked dark' },
  ', a ',
  { word: 'pianist', src: '/about/story-2.png', alt: 'Sheet music open on an upright piano' },
  ' since six, keeper of forty-odd ',
  { word: 'plants', src: '/about/story-3.png', alt: 'A window shelf crowded with houseplants' },
  ', maker of tiny ',
  { word: 'glass animals', src: '/about/story-4.png', alt: 'Small lampworked glass animals on a sill' },
  ', devoted to ',
  { word: 'long hikes', src: '/about/story-5.png', alt: 'A trail running out across open prairie' },
  ' on the prairie, a ',
  { word: 'matchbox', src: '/about/story-6.png', alt: 'A collection of printed matchboxes' },
  ' collector, and still chasing the perfect ',
  { word: 'espresso', src: '/about/story-7.png', alt: 'An espresso pulled into a small cup' },
  '.',
]

const PICTURES = STORY.filter((part): part is Exclude<Part, string> => typeof part !== 'string')

const ELSEWHERE = [
  { label: 'Résumé', href: RESUME },
  { label: 'LinkedIn', href: LINKEDIN },
  { label: 'Contact me', href: EMAIL },
]

// ── Screen three ──
// A subject and an opening line, so the badge opens a draft rather than just an
// empty window addressed to nobody in particular.
const MAILTO =
  `${EMAIL}?subject=${encodeURIComponent("Let's connect")}` +
  `&body=${encodeURIComponent('Hi Yuer,\n\n')}`

const RING_RADIUS = 82
/** the circle's own length, which the words are stretched to fill exactly */
const RING_LENGTH = 2 * Math.PI * RING_RADIUS
const RING_PATH =
  `M 110,110 m -${RING_RADIUS},0 ` +
  `a ${RING_RADIUS},${RING_RADIUS} 0 1,1 ${RING_RADIUS * 2},0 ` +
  `a ${RING_RADIUS},${RING_RADIUS} 0 1,1 -${RING_RADIUS * 2},0`

/** which screen the header is currently sitting on */
type Screen = 'stage' | 'story' | 'connect'

export default function About() {
  const stage = useRef<HTMLElement>(null)
  const story = useRef<HTMLElement>(null)
  const outro = useRef<HTMLParagraphElement>(null)
  /** which stage frame is up */
  const [frame, setFrame] = useState(0)
  const [screen, setScreen] = useState<Screen>('stage')
  /** which story picture is showing */
  const [shown, setShown] = useState(0)

  useEffect(() => {
    let raf = 0

    const read = () => {
      raf = 0
      const reaches = (el: HTMLElement | null) =>
        !!el && el.getBoundingClientRect().bottom > NAV_HEIGHT
      setScreen(
        reaches(stage.current) ? 'stage' : reaches(story.current) ? 'story' : 'connect'
      )

      const second = outro.current
      if (!second) return
      // the change-over happens the moment the second paragraph is on screen
      setFrame(second.getBoundingClientRect().top < window.innerHeight ? 1 : 0)
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }

    // scheduled rather than called outright, so the first read happens once the
    // layout has settled instead of in the middle of this effect
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <main className={`main about-page is-on-${screen}`}>
      {/* the copy here sits in a subtree that re-renders on hover, so it is
          revealed whole rather than taken apart word by word */}
      <ScrollReveal split={false} />

      {/* Nav */}
      <nav className="nav">
        <Link href="/" className="nav-name">YUER ZHU</Link>
        <div className="nav-links">
          <Link href="/">WORK</Link>
          <Link href="/play">PLAY</Link>
          <Link href="/about" className="is-active">ABOUT</Link>
        </div>
      </nav>

      {/* ── Screen one ── */}
      <section className="about-stage" ref={stage}>
        <div className="about-stage-media">
          {STAGE.map((shot, i) => (
            <Image
              key={shot.src}
              className={`about-stage-shot${i === frame ? ' is-up' : ''}`}
              src={shot.src}
              alt={i === frame ? shot.alt : ''}
              aria-hidden={i === frame ? undefined : true}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              priority={i === 0}
            />
          ))}
        </div>

        <span className="about-stage-mark about-stage-mark--dot" aria-hidden="true" />
        <p className="about-stage-intro">
          It&apos;s Yuer, but you read it like &ldquo;yoo-were&rdquo;.{' '}
          <span className="about-glyph" aria-hidden="true">✳</span> I&apos;m currently
          based in Olathe, Kansas, working as a product designer at Garmin.
        </p>

        <p className="about-stage-outro" ref={outro}>
          I&apos;ve been at this for 2 years, and I&apos;m drawn to the same
          thing I started with{' '}
          <span className="about-glyph" aria-hidden="true">→</span> making products
          feel <em>simple</em>, even when they&apos;re not.
        </p>

        <span className="about-stage-mark about-stage-mark--note">
          THIS IS ME,
          <br />
          DOING MY
          <br />
          DAILY THINGS
        </span>
      </section>

      {/* ── Screen two ── */}
      <section className="about-story" ref={story}>
        <div className="about-story-media">
          {PICTURES.map((picture, i) => (
            <Image
              key={picture.src}
              className={`about-story-shot${i === shown ? ' is-up' : ''}`}
              src={picture.src}
              alt={i === shown ? picture.alt : ''}
              aria-hidden={i === shown ? undefined : true}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          ))}
        </div>

        <div className="about-story-body">
          <span className="about-stage-mark about-stage-mark--dot" aria-hidden="true" />

          <p className="about-story-text">
            {STORY.map((part, i) =>
              typeof part === 'string' ? (
                <span key={i}>{part}</span>
              ) : (
                <button
                  key={i}
                  type="button"
                  className={`about-story-word${
                    PICTURES.indexOf(part) === shown ? ' is-shown' : ''
                  }`}
                  aria-pressed={PICTURES.indexOf(part) === shown}
                  onMouseEnter={() => setShown(PICTURES.indexOf(part))}
                  onFocus={() => setShown(PICTURES.indexOf(part))}
                  onClick={() => setShown(PICTURES.indexOf(part))}
                >
                  {part.word}
                </button>
              )
            )}
          </p>

          <p className="about-story-links">
            {ELSEWHERE.map((where) => (
              <a
                key={where.label}
                className="about-story-link"
                href={where.href}
                {...(where.href.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {where.label}
              </a>
            ))}
          </p>
        </div>
      </section>

      {/* ── Screen three ── */}
      <section className="about-connect">
        <p className="about-connect-lead">
          <span className="about-glyph" aria-hidden="true">✳</span> Let&apos;s connect!
        </p>
        <p className="about-connect-name">Yuer Zhu</p>

        <a className="about-connect-badge" href={MAILTO} aria-label="Email Yuer Zhu">
          <svg className="about-connect-ring" viewBox="0 0 220 220" aria-hidden="true">
            <defs>
              <path id="about-connect-ring-path" fill="none" d={RING_PATH} />
            </defs>
            <text>
              {/* stretched to the circle's own length, so the words close up
                  into a ring with no gap and no overlap */}
              <textPath
                href="#about-connect-ring-path"
                textLength={RING_LENGTH}
                lengthAdjust="spacing"
              >
                CLICK TO EMAIL ME ✳ CLICK TO EMAIL ME ✳
              </textPath>
            </text>
          </svg>

          <svg className="about-connect-envelope" viewBox="0 0 40 30" aria-hidden="true">
            <rect x="1.6" y="1.6" width="36.8" height="26.8" rx="3" />
            <path d="M2.4 4.2 20 17 37.6 4.2" />
          </svg>
        </a>
      </section>
    </main>
  )
}
