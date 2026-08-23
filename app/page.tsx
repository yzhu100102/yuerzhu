// app/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import ProjectMedia from './project-media'
import { CMU, GARMIN, RED_HOUSE } from './links'

// Matches --nav-height in globals.css. The header has to know where its own
// underside is to hand the black opening its colours back.
const NAV_HEIGHT = 48

type Project = {
  id: number
  title: string
  /** the line above the title — company, discipline, surface */
  kind: string
  description: string
  started: string
  role: string
  software: string
  /** sampled from the thumbnail itself, most characteristic first */
  swatches: string[]
  href: string
  image?: string
  /** looping video thumbnail; takes precedence over `image` */
  video?: string
  poster?: string
  /** CSS background for the card frame, and multiply blending for the video */
  background?: string
  endTitle?: string
  /** the thumbnail's own pixel size, so the card is never cropped */
  width: number
  height: number
}

// The dates, roles and software on the three Garmin projects are placeholders —
// they are not recorded anywhere in this repo. Yara's are the real ones, taken
// from its own case study.
const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Alpha Hunt App',
    kind: 'Garmin · Product Design · App',
    description:
      'A companion app for Garmin’s dog-tracking collars, built so position, terrain and pack status read at a glance from a moving vehicle.',
    started: 'March 2024',
    role: 'Product Designer',
    software: 'Figma, After Effects',
    swatches: ['#505628', '#ac6d4b', '#757473', '#0b0b0b'],
    image: '/projects/alpha-hunt-v3.jpg',
    href: '/projects/template',
    width: 1418,
    height: 1391,
  },
  {
    id: 2,
    title: 'Approach S72 Golf Biometrics',
    kind: 'Garmin · Product Design · Wearable',
    description:
      'Bringing heart rate and body battery onto the S72 golf watch without crowding the one number a player is actually on the course for.',
    started: 'August 2023',
    role: 'Product Designer',
    software: 'Figma, Illustrator',
    swatches: ['#902c01', '#ae744a', '#4e2615', '#0b0302'],
    image: '/projects/garmin-golf-biometrics-s72.jpg',
    href: '/projects/template',
    width: 1705,
    height: 1211,
  },
  {
    id: 3,
    title: 'Garmin Explore',
    kind: 'Garmin · Product Design · Web',
    description:
      'A rebuild of the trip-planning web app around the map itself, so routes, waypoints and gear stop living in three separate places.',
    started: 'January 2023',
    role: 'Product Designer',
    software: 'Figma',
    swatches: ['#a3b550', '#aabcd0', '#d8f0bd', '#faf9f7'],
    image: '/projects/garmin-explore.jpg',
    href: '/projects/template',
    width: 1616,
    height: 923,
  },
  {
    id: 4,
    title: 'Yara, for Yummly',
    kind: 'Concept · Conversation UI · User Research',
    description:
      'A conversational interface for cooking, shopping and meal planning, built on Yummly’s existing recipe platform.',
    started: 'January 2024',
    role: 'Sole designer, UX research, CUI design, motion',
    software: 'Figma, Illustrator, After Effects',
    swatches: ['#2d288f', '#f98b5a', '#fff6dc', '#007b61'],
    video: '/projects/project-four.mp4',
    poster: '/projects/project-four-poster.jpg',
    // White rather than a tint: the clip is mastered on white, so a white frame
    // on a white page leaves nothing of the card's own edge to see. It still
    // counts as a background, which is what puts the clip on multiply blending.
    background: '#ffffff',
    endTitle: 'Yara x Yummly',
    href: '/projects/yara',
    // The clip is 16:9, but the frame is deliberately set to the S72 card's
    // ratio so the two sit at a similar size in the stack.
    width: 1705,
    height: 1211,
  },
]

/** The width the album has to draw itself at a tighter step. */
const NARROW = 768

/**
 * How far apart the cards sit, on a wide screen and on a narrow one. `x/y/z`
 * step the ones still to come; `out*` carry the ones already read away. The
 * vertical figures are most of a screen, which is what sends both piles off the
 * top and bottom edges and leaves the one being read alone in the middle.
 */
const STEP = {
  // The vertical travel is in `vh`, not pixels. What a pile has to clear is the
  // card being read, whose height is set from the window's width — so on a wide
  // short screen a fixed figure either laps the card or throws the pile off the
  // bottom entirely. Measuring the travel against the window's own height keeps
  // both true at once.
  // Both piles are pushed well out on the diagonal and set a long way back, so
  // the one being read is the only thing at full size anywhere near the middle.
  wide: { x: 300, y: 64, z: 380, outX: 300, outY: 66, outZ: 460 },
  // the narrow layout stacks the copy above and below the album, so the piles
  // stay near the card rather than travelling into it
  narrow: { x: 62, y: 11, z: 190, outX: 70, outY: 12, outZ: 260 },
}

/**
 * How far the nth card out has travelled, as a multiple of one step. The first
 * step is the big one — far enough to leave the card being read alone in the
 * middle — and everything past it barely moves, so the rest of the pile stays
 * hanging off the edge as a run of visible edges rather than flying off it.
 */
const reach = (n: number) => (n === 0 ? 0 : 1 + (n - 1) * 0.1)

/**
 * Whether the stage is on a narrow screen. Read as external state so the server
 * renders the wide album and a window dragged across the breakpoint re-reads it.
 */
function useNarrow() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(`(max-width: ${NARROW}px)`)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(`(max-width: ${NARROW}px)`).matches,
    () => false
  )
}

/**
 * Where a card sits relative to the one that is up.
 *
 * The album runs from the bottom left to the top right: what is still to come
 * waits down and to the left, so scrolling down brings it up into the middle
 * the way turning down through a pile would. What has been read lifts away to
 * the top right and stays in sight, smaller and leaning the other way, so the
 * two piles are told apart by which way they face.
 *
 * Nothing here is a scale: the depth is real, so the perspective on the frame
 * does the shrinking and the stack reads as photographs rather than icons.
 */
function cardTransform(offset: number, step: typeof STEP.wide) {
  // the one being read: square on, dead centre
  if (offset === 0) return 'translate(-50%, -50%)'

  const n = reach(Math.abs(offset))

  // still to come: hung off the bottom left, leaning away
  if (offset > 0) {
    return (
      `translate(-50%, -50%) ` +
      `translate3d(${-n * step.x}px, ${n * step.y}vh, ${-n * step.z}px) ` +
      `rotateY(21deg) rotateZ(${2.4 * offset}deg)`
    )
  }

  // already read: hung off the top right, set back further and leaning the
  // opposite way
  return (
    `translate(-50%, -50%) ` +
    `translate3d(${n * step.outX}px, ${-n * step.outY}vh, ${-n * step.outZ}px) ` +
    `rotateY(-22deg) rotateZ(${3.4 * offset}deg)`
  )
}

export default function Home() {
  const scroller = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const stack = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const count = useRef<HTMLParagraphElement>(null)
  const [active, setActive] = useState(0)
  /** the work has come up far enough to assemble itself */
  const [entered, setEntered] = useState(false)
  /** the black opening is still the thing under the header */
  const [onHero, setOnHero] = useState(true)
  const step = useNarrow() ? STEP.narrow : STEP.wide

  // How far the page has been scrolled picks the project, so the stage can be
  // held still while the reader moves through the work at their own pace.
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const el = scroller.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const progress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0
      setActive(Math.min(PROJECTS.length - 1, Math.floor(progress * PROJECTS.length)))
      // the composition assembles once as the work comes up to fill the screen,
      // and stays put after — re-running it on the way back up reads as a fault
      setEntered((was) => was || rect.top <= window.innerHeight * 0.12)
      setOnHero(rect.top > NAV_HEIGHT)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    // scheduled rather than called outright, so the first read lands after the
    // layout has settled instead of inside this effect
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // The index slides so whichever project is up sits on the centre line. It is
  // measured rather than counted in item-heights, because the descriptions run
  // to different numbers of lines.
  useEffect(() => {
    const el = list.current
    const item = el?.children[active] as HTMLElement | undefined
    if (!el || !item) return
    el.style.transform = `translateY(${-(item.offsetTop + item.offsetHeight / 2)}px)`
  }, [active])

  // The cursor leans the whole stack a few degrees, so the album shifts under
  // the hand rather than sitting flat.
  useEffect(() => {
    const el = stack.current
    const frame = stage.current
    if (!el || !frame) return
    let raf = 0
    let lean = { x: 0, y: 0 }

    const write = () => {
      raf = 0
      el.style.setProperty('--lean-x', `${lean.x.toFixed(2)}deg`)
      el.style.setProperty('--lean-y', `${lean.y.toFixed(2)}deg`)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(write)
    }
    const onMove = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect()
      lean = {
        x: -((e.clientY - r.top) / r.height - 0.5) * 7,
        y: ((e.clientX - r.left) / r.width - 0.5) * 12,
      }
      queue()
    }
    const onLeave = () => {
      lean = { x: 0, y: 0 }
      queue()
    }

    frame.addEventListener('pointermove', onMove)
    frame.addEventListener('pointerleave', onLeave)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Sets the counter down on the card's top-left corner, lapping it by a
  // quarter of the figure — the bottom-right one — so the corner of the
  // thumbnail is all that is crossed, whatever shape it happens to be.
  useEffect(() => {
    const place = () => {
      const st = stage.current
      const origin = stack.current
      const card = origin?.querySelector<HTMLElement>('.work-card.is-up')
      const figure = count.current?.querySelector<HTMLElement>('.work-count-number')
      if (!st || !origin || !card || !figure) return

      const stageBox = st.getBoundingClientRect()
      // the stack is a zero-sized box at the point every card is centred on,
      // so its own position is the corner measured back from
      const originBox = origin.getBoundingClientRect()
      const cardX = originBox.left - stageBox.left - card.offsetWidth / 2
      const cardY = originBox.top - stageBox.top - card.offsetHeight / 2

      // half the figure sits left of the corner and half above it, which leaves
      // exactly its bottom-right quarter over the card. `offset*` steps back
      // out to the block, which carries the label above the figure.
      const x = cardX - figure.offsetWidth / 2 - figure.offsetLeft
      const y = cardY - figure.offsetHeight / 2 - figure.offsetTop

      st.style.setProperty('--count-x', `${Math.round(x)}px`)
      // never far enough up to end up under the header
      st.style.setProperty(
        '--count-y',
        `${Math.round(Math.max(NAV_HEIGHT + 14, y))}px`
      )
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [active])

  /**
   * Puts a project up by scrolling to its share of the page, so the scroll
   * position stays the one thing deciding what is on the stage.
   */
  const goTo = (i: number) => {
    const el = scroller.current
    if (!el) return
    const travel = el.offsetHeight - window.innerHeight
    window.scrollTo({
      top: el.offsetTop + travel * ((i + 0.5) / PROJECTS.length),
    })
  }

  const current = PROJECTS[active]

  return (
    <main className={`main work${onHero ? ' is-on-hero' : ''}`}>
      {/* Nav */}
      <nav className="nav">
        <Link href="/" className="nav-name">YUER ZHU</Link>
        <div className="nav-links">
          <Link href="/" className="is-active">WORK</Link>
          <Link href="/play">PLAY</Link>
          <Link href="/about">ABOUT</Link>
        </div>
      </nav>

      {/* The opening, on black */}
      <section className="hero hero--dark">
        <h1 className="hero-title">
          YUER IS A <em>PRODUCT DESIGNER</em> DRIVEN BY STORYTELLING, CRAFT, AND
          INTENTIONAL DETAILS.
        </h1>
        <p className="hero-subtitle">
          CURRENTLY, SHE&apos;S DESIGNING <em>OUTDOOR EXPERIENCES</em>{' '}
          <a className="link" href={GARMIN} target="_blank" rel="noopener noreferrer">
            @GARMIN
          </a>
          .
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <span className="meta-icon">⊙</span>
            <span>
              BACHELOR OF DESIGN + HCI{' '}
              <a className="link" href={CMU} target="_blank" rel="noopener noreferrer">
                @CARNEGIE MELLON UNIVERSITY
              </a>
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⊙</span>
            <span>
              PREVIOUSLY DESIGNING{' '}
              <a className="link" href={RED_HOUSE} target="_blank" rel="noopener noreferrer">
                @RED HOUSE COMMUNICATIONS
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* One screen of scroll per project, spent on a stage that holds still */}
      <div
        className="work-scroll"
        ref={scroller}
        style={{ height: `${PROJECTS.length * 100}vh` }}
      >
        <div className={`work-stage${entered ? ' is-in' : ''}`} ref={stage}>
          {/* ── how it was made ── */}
          <dl className="work-meta">
            <div className="work-meta-row">
              <dt>Started</dt>
              <dd>{current.started}</dd>
            </div>
            <div className="work-meta-row">
              <dt>Role</dt>
              <dd>{current.role}</dd>
            </div>
            <div className="work-meta-row">
              <dt>Software</dt>
              <dd>{current.software}</dd>
            </div>
          </dl>

          {/* ── the album ── */}
          <div className="work-frame">
            <div className="work-stack" ref={stack}>
              {PROJECTS.map((project, i) => {
                const offset = i - active
                return (
                  <Link
                    key={project.id}
                    href={project.href}
                    className={`work-card${offset === 0 ? ' is-up' : ''}`}
                    aria-hidden={offset === 0 ? undefined : true}
                    tabIndex={offset === 0 ? undefined : -1}
                    style={{
                      transform: cardTransform(offset, step),
                      opacity:
                        offset < 0
                          ? // read, but still on the stage
                            Math.max(0.2, 1 + offset * 0.22)
                          : Math.max(0, 1 - offset * 0.26),
                      zIndex: offset > 0 ? 50 - offset : 50 + offset,
                    }}
                  >
                    <div
                      className={
                        project.background
                          ? 'project-image project-image--tinted'
                          : 'project-image'
                      }
                      style={{
                        aspectRatio: `${project.width} / ${project.height}`,
                        background: project.background,
                      }}
                    >
                      {project.video && offset === 0 ? (
                        // mounted only while the card is up: back in the stack
                        // the clip would sit on its own end title, which reads
                        // as a solid block of colour rather than a thumbnail
                        <ProjectMedia
                          src={project.video}
                          poster={project.poster}
                          label={project.title}
                          endTitle={project.endTitle}
                        />
                      ) : (
                        <Image
                          src={(project.image || project.poster)!}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 70vw, 38vw"
                          style={{ objectFit: 'cover' }}
                          priority={i === 0}
                        />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── the index ── */}
          <div className="work-index">
            <ol className="work-list" ref={list}>
              {PROJECTS.map((project, i) => (
                <li
                  key={project.id}
                  className={`work-list-item${i === active ? ' is-active' : ''}`}
                >
                  <p className="work-list-kind">{project.kind}</p>
                  <Link
                    className="work-list-title"
                    href={project.href}
                    onFocus={() => goTo(i)}
                    onMouseEnter={() => goTo(i)}
                  >
                    {project.title}
                  </Link>
                  <span className="work-list-rule" aria-hidden="true">—</span>
                  <p className="work-list-desc">{project.description}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* ── the palette ── */}
          <ul className="work-swatches" aria-hidden="true">
            {current.swatches.map((colour) => (
              <li key={colour} className="work-swatch" style={{ background: colour }} />
            ))}
          </ul>

          {/* ── where you are ── */}
          <p className="work-count" ref={count}>
            <span className="work-count-label">Selected work</span>
            <span className="work-count-figure">
              <span className="work-count-number">
                {String(active + 1).padStart(2, '0')}
              </span>
              <span className="work-count-total">
                /{String(PROJECTS.length).padStart(2, '0')}
              </span>
            </span>
          </p>

          <span className="work-hint">Scroll</span>
        </div>
      </div>
    </main>
  )
}
