// app/about/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ScrollReveal from '../scroll-reveal'
import Knot from '../knot'
import Mark, { type MarkName } from '../marks'
import { LINKEDIN, RESUME, SAY_HELLO } from '../links'

// Matches --nav-height in globals.css. The header has to know where its own
// underside is to take the colours of whichever screen has reached it.
const NAV_HEIGHT = 48

// ── Screen one ──
// A portrait down the left, held under the opening paragraph and given its own
// proportions rather than cropped to a frame.
const PORTRAIT = {
  // A new name rather than the old one overwritten: this project's image
  // optimiser keeps serving the previous bytes for a path whose file has
  // changed underneath it, and a rename is what actually clears it.
  src: '/about/portrait-color.jpg',
  alt: 'Yuer, in front of a Japanese maple',
  width: 1100,
  height: 1371,
}

// ── Screen two ──
// The story reads as one sentence; the words carrying a picture light the frame
// beside them when pointed at, tapped or tabbed to, and each one wears a small
// mark of its own. A plain string is just text, an object is a word with a
// photograph behind it.
type Picture = {
  word: string
  mark: MarkName
  src: string
  alt: string
  /** the photograph's own pixel size — nothing here is cropped to a frame */
  width: number
  height: number
  /** where it lands in the white, as a share of the screen it sits on */
  x: string
  y: string
}

type Part = string | Picture

const STORY: Part[] = [
  "I'm a baker of ",
  {
    word: 'anything sweet',
    mark: 'cake',
    src: '/about/sweets.jpg',
    alt: 'A cake, iced and finished at home',
    width: 1200,
    height: 1600,
    x: '4%',
    y: '28%',
  },
  ' and a captive of playing ',
  {
    word: 'tennis',
    mark: 'racket',
    src: '/about/tennis.jpg',
    alt: 'A tennis court',
    width: 1600,
    height: 1066,
    x: '24%',
    y: '6%',
  },
  '. I like ',
  {
    word: 'hiking',
    mark: 'mountain',
    src: '/about/hike.jpg',
    alt: 'A hike outside Seattle',
    width: 1200,
    height: 1600,
    x: '9%',
    y: '50%',
  },
  ' in Seattle, admiring ',
  {
    word: 'ceramics',
    mark: 'vase',
    src: '/about/ceramics.jpg',
    alt: 'Ceramics brought back from a trip to Japan',
    width: 1600,
    height: 1066,
    x: '21%',
    y: '38%',
  },
  ', and hunting for the perfect ',
  {
    word: 'kouign-amann',
    mark: 'spiral',
    src: '/about/kouign-amann.jpg',
    alt: 'A pastry, close but not a kouign-amann',
    width: 1200,
    height: 1600,
    x: '2%',
    y: '6%',
  },
  '\u00a0(cousin of the croissant).',
]

const PICTURES = STORY.filter((part): part is Picture => typeof part !== 'string')

/**
 * The one the page opens on, found by the word it belongs to rather than by
 * position — reordering the sentence should not quietly change which
 * photograph greets whoever arrives.
 */
const OPENS_ON = Math.max(
  0,
  PICTURES.findIndex((picture) => picture.word === 'hiking')
)

// The page signs off on these rather than on a screen of its own: set in the
// display face, down in the bottom right corner of the last screen. The résumé
// is a PDF served from public/, so it opens in the browser's own reader.
const ELSEWHERE = [
  { label: 'Contact Me', href: SAY_HELLO },
  { label: 'LinkedIn', href: LINKEDIN },
  { label: 'Resume', href: RESUME },
]

/** which screen the header is currently sitting on */
type Screen = 'stage' | 'story'

export default function About() {
  const stage = useRef<HTMLElement>(null)
  const story = useRef<HTMLElement>(null)
  const [screen, setScreen] = useState<Screen>('stage')
  /**
   * Which picture the page has settled on, and which one is being looked at.
   *
   * Pointing at a word is a question, not an answer: the picture comes up while
   * the pointer is on it and the page goes back to what it was showing the
   * moment it leaves. Only a click changes what the page has settled on — so a
   * reader can wander down the sentence and still end up back where they were.
   */
  const [shown, setShown] = useState(OPENS_ON)
  const [asked, setAsked] = useState<number | null>(null)

  useEffect(() => {
    let raf = 0

    const read = () => {
      raf = 0
      const reaches = (el: HTMLElement | null) =>
        !!el && el.getBoundingClientRect().bottom > NAV_HEIGHT
      setScreen(reaches(stage.current) ? 'stage' : 'story')
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

  /** the picture on the page: whatever is being pointed at, or what was chosen */
  const up = asked ?? shown

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
        <div className="about-stage-media parallax-in" data-parallax="0.1">
          <Image
            className="about-stage-shot"
            src={PORTRAIT.src}
            alt={PORTRAIT.alt}
            width={PORTRAIT.width}
            height={PORTRAIT.height}
            sizes="(max-width: 768px) 70vw, 34vh"
            priority
          />
        </div>

        <Knot className="about-stage-mark about-stage-mark--dot" />
        <p className="about-stage-intro" data-parallax="0.05">
          It&apos;s Yuer, pronounced <em>&ldquo;yoo-er&rdquo;</em>{' '}like how
          it&apos;s spelled!{' '}
          <Knot className="about-glyph" /> I&apos;m currently
          based in Olathe, Kansas, working as a <em>product designer</em> at
          Garmin.
        </p>

        <p className="about-stage-outro" data-parallax="0.05">
          I&apos;ve been in the <em>design + hardware</em>{' '}intersection for 2
          years, and I&apos;m drawn to the same thing I started with{' '}
          <Knot className="about-glyph" /> making products{' '}
          <em>feel</em>{' '}simple, even when they&apos;re not.
        </p>
      </section>

      {/* ── Screen two ── */}
      <section className="about-story" ref={story}>
        {/* Each one at its own proportions and its own place in the white —
            no frame to crop to, and no two landing on the same spot. */}
        <div className="about-story-media">
          {PICTURES.map((picture, i) => (
            <Image
              key={picture.src}
              className={`about-story-shot${i === up ? ' is-up' : ''}`}
              style={{ '--x': picture.x, '--y': picture.y } as React.CSSProperties}
              src={picture.src}
              alt={i === up ? picture.alt : ''}
              aria-hidden={i === up ? undefined : true}
              width={picture.width}
              height={picture.height}
              sizes="(max-width: 768px) 70vw, 30vw"
            />
          ))}
        </div>

        <div className="about-story-body">
          <Knot className="about-stage-mark about-stage-mark--dot" />

          <p className="about-story-text">
            {STORY.map((part, i) => {
              if (typeof part === 'string') return <span key={i}>{part}</span>
              const index = PICTURES.indexOf(part)
              return (
                <button
                  key={i}
                  type="button"
                  className={`about-story-word${
                    index === shown ? ' is-shown' : ''
                  }`}
                  aria-pressed={index === shown}
                  onMouseEnter={() => setAsked(index)}
                  onMouseLeave={() => setAsked(null)}
                  onFocus={() => setAsked(index)}
                  onBlur={() => setAsked(null)}
                  onClick={() => {
                    setShown(index)
                    setAsked(null)
                  }}
                >
                  <Mark name={part.mark} />
                  {part.word}
                </button>
              )
            })}
          </p>

          <div className="about-story-links">
            <p className="say-hello">Say hello</p>
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
          </div>
        </div>
      </section>
    </main>
  )
}
