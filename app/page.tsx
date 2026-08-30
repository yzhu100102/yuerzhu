// app/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import ProjectMedia from './project-media'
import Knot from './knot'
import Mark from './marks'
import ScrollReveal from './scroll-reveal'
import { CMU, GARMIN, RED_HOUSE } from './links'

// Matches --nav-height in globals.css. The header has to know where its own
// underside is to hand the black opening its colours back.
const NAV_HEIGHT = 48

type Project = {
  id: number
  title: string
  /** the line above the title — who it was for, and what it is */
  kind: string
  description: string
  /**
   * How it was made, in the order it is read: what the job was, when, and
   * with what. Each row's values are set one to a line rather than run
   * together with commas — a list of four roles on one line reads as a
   * sentence someone forgot to finish.
   */
  meta: { label: string; values: string[] }[]
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

// The descriptions on the three Garmin projects are the résumé's own words for
// them. Yara's row is the one from its own case study, so the stage and the
// study never disagree about what the work was.
const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Alpha Hunt',
    kind: 'Garmin • App',
    description:
      'A set of in-field tools for hunters, including map-integrated weather data, map layers, compass and rangefinder.',
    meta: [
      { label: 'Role', values: ['Product Designer', 'UX research'] },
      { label: 'Launching', values: ['Q3 2027', 'Ongoing'] },
      { label: 'Programs', values: ['Figma'] },
    ],
    swatches: ['#505628', '#ac6d4b', '#757473', '#0b0b0b'],
    image: '/projects/alpha-hunt-v3.jpg',
    href: '/projects/alpha-hunt',
    width: 1418,
    height: 1391,
  },
  {
    id: 2,
    title: 'Approach S72 Golf Biometrics',
    kind: 'Garmin • Wearable',
    description:
      'A new heart rate feature for one of Garmin’s new golf watches, enabling golfers to make data-driven insights during and after a round.',
    meta: [
      { label: 'Role', values: ['Product Designer'] },
      { label: 'Launching', values: ['Q4 2026'] },
      { label: 'Programs', values: ['Figma'] },
    ],
    swatches: ['#902c01', '#ae744a', '#4e2615', '#0b0302'],
    image: '/projects/garmin-golf-biometrics-s72.jpg',
    href: '/projects/template',
    width: 1705,
    height: 1211,
  },
  {
    id: 3,
    title: 'Garmin Explore',
    kind: 'Garmin • Web',
    description:
      'Leading the 0–1 redesign of Garmin Explore Web, an outdoor mapping, navigation, planning and data management ecosystem.',
    meta: [
      { label: 'Role', values: ['Product Designer', 'UX research'] },
      { label: 'Timeline', values: ['Ongoing'] },
      { label: 'Programs', values: ['Figma'] },
    ],
    swatches: ['#a3b550', '#aabcd0', '#d8f0bd', '#faf9f7'],
    image: '/projects/garmin-explore.jpg',
    href: '/projects/template',
    width: 1616,
    height: 923,
  },
  {
    id: 4,
    title: 'Yara, for Yummly',
    kind: 'Concept • Conversation UI',
    description:
      'A conversational interface for cooking, shopping and meal planning, built on Yummly’s existing recipe platform.',
    meta: [
      {
        label: 'Role',
        values: ['Sole designer', 'UX research', 'CUI design', 'Motion'],
      },
      { label: 'Timeline', values: ['13 weeks', 'Spring 2024'] },
      { label: 'Programs', values: ['Figma', 'Illustrator', 'After Effects'] },
    ],
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
  // The depth figures are what shrink the two piles: against a 1500px
  // perspective a card 1100 back is drawn at 58% and one 1350 back at 53%, so
  // the one being read is plainly the largest thing anywhere on the stage.
  // Sending them back also pulls them in toward the vanishing point, which is
  // why the sideways step is so much larger than the gap it actually buys.
  wide: { x: 640, y: 97, z: 1100, outX: 640, outY: 99, outZ: 1350 },
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
 * How far past a boundary the scroll has to come before the card changes, as a
 * fraction of one project's share of the page.
 *
 * Without it the index is a bare `floor()` of the scroll position, and a
 * boundary is a knife edge: a pixel of wobble — a trackpad settling, the
 * rubber-band at the end of a fling, a phone's chrome sliding away — lands on
 * either side of it in consecutive frames and the album flips back and forth.
 * The band is only ever crossed in the direction of travel, so nothing is ever
 * skipped; it just has to be committed to.
 */
const SETTLE = 0.08

/**
 * How recently the pointer must have moved for a `mouseenter` to count as the
 * reader choosing a project rather than the index sliding under a still hand.
 * A frame or two — long enough to bridge the gap between a move and the enter
 * it causes, short enough that a hand at rest never qualifies.
 */
const POINTER_GRACE = 120

/**
 * Whether the hand moved recently enough that a boundary event can be put down
 * to it. Kept out of the component so that reading the clock — which is what
 * makes this a question about now rather than about props — is plainly not
 * something the render does.
 */
function movedRecently(at: number) {
  return performance.now() - at < POINTER_GRACE
}

/**
 * How much of the counter laps the thumbnail, on each axis, as a fraction of
 * the numeral's own box. Small: the figure hangs off the corner and only its
 * last corner crosses the picture, so the work is not read through it.
 */
const OVERLAP = 0.26

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
  const hero = useRef<HTMLElement>(null)
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
  const narrow = useNarrow()
  const step = narrow ? STEP.narrow : STEP.wide
  /** when the hand last actually moved the pointer */
  const lastPointerMove = useRef(-Infinity)

  // How far the page has been scrolled picks the project, so the stage can be
  // held still while the reader moves through the work at their own pace.
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const el = scroller.current
      // On a narrow screen the stage is not in the layout at all — the work is
      // a plain stack under the opening — so it collapses to nothing and there
      // is no travel to read. The opening's own underside says where the black
      // ends instead, which is all the header needs.
      if (!el || !el.offsetHeight) {
        const opening = hero.current
        if (opening) setOnHero(opening.getBoundingClientRect().bottom > NAV_HEIGHT)
        return
      }
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const progress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0

      // where the scroll is, counted in projects rather than pixels
      const place = progress * PROJECTS.length
      const band = Math.min(PROJECTS.length - 1, Math.floor(place))
      const into = place - Math.floor(place)
      setActive((was) => {
        if (band === was) return was
        // Coming down the page a new band is entered at its top, so the scroll
        // has to be `SETTLE` past that edge; going back up it is entered at the
        // bottom, so it has to be `SETTLE` clear of that one instead.
        const committed = band > was ? into > SETTLE : into < 1 - SETTLE
        return committed ? band : was
      })
      // The composition assembles as soon as any of the work is showing, which
      // on arrival is the band already peeking under the black — a stage that
      // waits until it fills the screen leaves that band empty and white, and
      // the page looks like it has nothing under the opening. It stays put
      // after; re-running it on the way back up reads as a fault.
      setEntered((was) => was || rect.top <= window.innerHeight * 0.98)
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
    // the narrow layout puts only the project being read in the column, in the
    // flow, so there is no run of them to slide
    el.style.transform = narrow
      ? ''
      : `translateY(${-(item.offsetTop + item.offsetHeight / 2)}px)`
  }, [active, narrow])

  // Whether a `mouseenter` on a title came from the hand or from the list
  // sliding underneath a pointer at rest. Only a real move is recorded, so an
  // element arriving under a still cursor leaves the figure alone.
  useEffect(() => {
    const onMove = () => {
      lastPointerMove.current = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

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

  // Sets the counter down on the card's top-left corner, so the corner of the
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

      // `OVERLAP` of the figure sits over the card on each axis and the rest
      // hangs off it, so what crosses the picture is a small corner of the
      // numeral rather than a quarter of it. `offset*` steps back out to the
      // block, which carries the label above the figure and the total beside it.
      const x = cardX - figure.offsetWidth * (1 - OVERLAP) - figure.offsetLeft
      const y = cardY - figure.offsetHeight * (1 - OVERLAP) - figure.offsetTop

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
    if (!el || i === active) return
    const travel = el.offsetHeight - window.innerHeight
    window.scrollTo({
      top: el.offsetTop + travel * ((i + 0.5) / PROJECTS.length),
    })
  }

  /**
   * The same, but only when the pointer actually went to the title.
   *
   * The index slides so that whichever project is up sits on the centre line,
   * which means that scrolling the page walks the titles underneath a pointer
   * that has not moved at all — and each one they pass under fires `mouseenter`
   * as if it had been chosen. That scrolled the page back to it, which slid the
   * list again, which crossed another title: the album fought whoever was
   * reading it, worst of all on the way back up. A `mouseenter` that the hand
   * did not cause is not a choice, so it is ignored.
   */
  const onTitleEnter = (i: number) => {
    if (movedRecently(lastPointerMove.current)) goTo(i)
  }

  const current = PROJECTS[active]

  return (
    <main className={`main work${onHero ? ' is-on-hero' : ''}`}>
      {/* The narrow layout's stack arrives as it is scrolled to, the way the
          wide layout's stage assembles. Whole blocks rather than word by word:
          this page re-renders on every scroll frame, and taking its copy apart
          underneath React is asking for trouble. */}
      <ScrollReveal split={false} />

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
      <section className="hero hero--dark" ref={hero}>
        {/* the copy moves a little slower than the page it is leaving */}
        <div className="hero-inner" data-parallax="0.09">
          <h1 className="hero-title">
            Yuer <Knot /> is a <em>product designer</em> driven by storytelling,
            craft, and intentional details.
          </h1>
          <p className="hero-subtitle">
            Currently, she&apos;s designing <em>outdoor experiences</em>{' '}
            <a className="link" href={GARMIN} target="_blank" rel="noopener noreferrer">
              @Garmin
            </a>
            .
          </p>
          <div className="hero-meta">
            <div className="meta-item">
              <Knot className="meta-icon" />
              <span>
                Bachelor of Design + HCI{' '}
                <a className="link" href={CMU} target="_blank" rel="noopener noreferrer">
                  @Carnegie Mellon University
                </a>
              </span>
            </div>
            <div className="meta-item">
              <Knot className="meta-icon" />
              <span>
                Previously designing{' '}
                <a className="link" href={RED_HOUSE} target="_blank" rel="noopener noreferrer">
                  @Red House Communications
                </a>
              </span>
            </div>
          </div>

          <p className="hero-note">
            <Mark name="screen" />
            This site is best viewed on desktop.
          </p>
        </div>
      </section>

      {/* ── The work, on a narrow screen ──
          A plain stack: thumbnail, then the project's name and its labels
          under it, in source order. The album below is not in the layout at
          this width and this one is not in it above it — the stylesheet picks
          between them, so neither is ever built twice. */}
      <section className="work-mobile">
        {PROJECTS.map((project) => (
          <Link href={project.href} key={project.id} className="project-card">
            <div
              className={
                project.background
                  ? 'project-image project-image--tinted'
                  : 'project-image parallax-in'
              }
              /* only the photographs drift: the Yara card is a clip mastered
                 to its own frame, and cropping into it would cut the artwork */
              data-parallax={project.background ? undefined : '0.05'}
              style={{
                aspectRatio: `${project.width} / ${project.height}`,
                background: project.background,
              }}
            >
              {project.video && narrow ? (
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
                  sizes="100vw"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="project-info">
              <h2 className="project-title">{project.title}</h2>
              <p className="project-subheader">{project.kind}</p>
            </div>
          </Link>
        ))}
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
            {current.meta.map((row) => (
              <div className="work-meta-row" key={row.label}>
                <dt>{row.label}</dt>
                {row.values.map((value) => (
                  <dd key={value}>{value}</dd>
                ))}
              </div>
            ))}
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
                      {project.video && offset === 0 && !narrow ? (
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
                    onMouseEnter={() => onTitleEnter(i)}
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
