// app/play/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

// One tile of the canvas. It repeats in every direction, so panning never ends.
const WORLD = { width: 2700, height: 2000 }
// The canvas offset is wrapped into (-size, 0], so the tile at -1 sits entirely
// off the left/top edge and can never be seen. Two tiles per axis cover every
// pan position, and dropping the third cuts the DOM — and the number of video
// elements competing for connections — by more than half.
const TILES = [0, 1]

// Kinetics. FRICTION is per-frame decay; WHEEL_IMPULSE is tuned against it so a
// wheel tick's total glide distance still equals the delta the browser reported.
const FRICTION = 0.92
const WHEEL_IMPULSE = 1 - FRICTION
const PARALLAX_EASE = 0.08

// The collage is laid out at a size that suits a desktop window. At phone width
// a single box is as wide as the screen, so the canvas is drawn smaller and the
// reader sees a collage rather than one piece at a time. `.play-caption` is set
// proportionally larger in the stylesheet so the type comes back out the size
// it reads at everywhere else.
const MOBILE_BREAKPOINT = 768
const MOBILE_SCALE = 0.65

// Where to open. The tile's own origin is a quiet corner — on a small screen it
// is a blank page — so the canvas starts centred on the densest cluster of work.
const FOCUS = { x: 1180, y: 700 }

// ── Grouped work ──
// One box per piece. A box shows a still, cycles a set of stills, or plays a
// clip; opening it gives the full-size version. Boxes that belong to the same
// piece sit side by side and share one set of shots, each opening on its own.

type Shot = {
  src: string
  w: number
  h: number
  video?: boolean
  /** clips play silent unless this says otherwise */
  sound?: boolean
  /** a Vimeo id, shown in that player instead of a local file */
  vimeo?: string
  /** a YouTube id, likewise */
  youtube?: string
}

type Group = {
  id: string
  title: string
  description: string
  x: number
  y: number
  w: number
  h: number
  /** parallax depth */
  d: number
  /** stacking order; the tucked half of an overlapping pair sits lower */
  z?: number
  /** a single still in the box */
  image?: string
  /** stills cycled in the box */
  loop?: string[]
  /** how long each frame holds, in ms */
  loopMs?: number
  /** switch frames instantly rather than cross-fading */
  hardCut?: boolean
  /** a light cut played in the box; the viewer loads the full-size one */
  video?: string
  shots: Shot[]
  /** which shot the viewer opens on */
  startAt?: number
}

const still = (src: string, w = 1600, h = 1059): Shot => ({ src, w, h })

const SALT_LOOP = [0, 1, 2, 3, 4, 5].map((n) => `/play/saltbook/${n}.jpg`)
const SALT_SHOTS = [
  ...SALT_LOOP.map((src) => still(src)),
  still('/play/saltbook/open.jpg'),
]

const SOUNDBOX_LOOP = ['sbfront', 'sbboxontop', 'open2', 'group2', 'side'].map(
  (name) => `/play/soundbox/${name}.jpg`
)

const SOUNDBOX_SHOTS: Shot[] = [
  ...SOUNDBOX_LOOP.map((src) => still(src, 1600, 1066)),
  { src: '/play/soundbox/reel.mp4', w: 1280, h: 720, video: true, sound: true },
]

const S3_LOOP = [1, 2, 3].map((n) => `/play/s3/package${n}.jpg`)

const PUB_SHOTS = [
  still('/play/publications/publications.jpg', 1600, 1000),
  still('/play/publications/mockup2.jpg', 1600, 1184),
]

const HERO_SHOTS: Shot[] = [
  still('/play/designhero/booklet.jpg', 1600, 941),
  still('/play/designhero/poster.jpg', 1600, 1192),
  // the boxes preview the local clips; opening any of them plays the film
  { src: '', w: 1280, h: 720, vimeo: '821665670' },
]

/** Index of the film in HERO_SHOTS, which every clip box opens on. */
const HERO_FILM = HERO_SHOTS.length - 1

const HERO_CLIPS = [
  { id: 'dh-clip1', file: 'clip1', x: 1400, y: 1565, d: 0.8 },
  { id: 'dh-clip2', file: 'clip2', x: 1855, y: 90, d: 1.2 },
  { id: 'dh-clip3', file: 'clip3', x: 963, y: 1538, d: 0.6 },
  { id: 'dh-clip5', file: 'clip5', x: 2309, y: 1187, d: 1.4 },
]

const groups: Group[] = [
  {
    id: 'sb-loop',
    title: 'THE HIDDEN CITY OF SALT',
    description: 'Add a short description of this piece.',
    x: 993, y: 516, w: 350, h: 232, d: 0.9,
    loop: SALT_LOOP,
    loopMs: 900,
    shots: SALT_SHOTS,
  },
  {
    id: 'sb-open',
    title: 'THE HIDDEN CITY OF SALT',
    description: 'Add a short description of this piece.',
    x: 1305, y: 702, w: 350, h: 232, d: 1.2, z: 3,
    image: '/play/saltbook/open.jpg',
    shots: SALT_SHOTS,
    startAt: SALT_SHOTS.length - 1,
  },
  {
    id: 'sx-loop',
    title: 'SOUNDBOX',
    description: 'Add a short description of this piece.',
    x: 924, y: 21, w: 350, h: 234, d: 1.1,
    loop: SOUNDBOX_LOOP,
    // a slower cycle than the Salt Book's
    loopMs: 1500,
    hardCut: true,
    shots: SOUNDBOX_SHOTS,
  },
  {
    id: 'sx-reel',
    title: 'SOUNDBOX — FINAL REEL',
    description: 'Add a short description of this piece.',
    x: 1403, y: 1220, w: 350, h: 197, d: 0.7,
    video: '/play/soundbox/reel-preview.mp4',
    shots: SOUNDBOX_SHOTS,
    startAt: SOUNDBOX_SHOTS.length - 1,
  },
  {
    id: 'pub-a',
    title: 'PUBLICATIONS',
    description: 'Add a short description of this piece.',
    x: 494, y: 149, w: 350, h: 219, d: 1.3,
    image: '/play/publications/publications.jpg',
    shots: PUB_SHOTS,
  },
  {
    id: 'pub-b',
    title: 'PUBLICATIONS',
    description: 'Add a short description of this piece.',
    x: 1851, y: 1060, w: 350, h: 259, d: 0.6,
    image: '/play/publications/mockup2.jpg',
    shots: PUB_SHOTS,
    startAt: 1,
  },
  {
    id: 'dh-booklet',
    title: 'DESIGN HERO',
    description: 'Add a short description of this piece.',
    x: 2299, y: 70, w: 350, h: 206, d: 1,
    image: '/play/designhero/booklet.jpg',
    shots: HERO_SHOTS,
  },
  {
    id: 'dh-poster',
    title: 'DESIGN HERO',
    description: 'Add a short description of this piece.',
    x: 2269, y: 1582, w: 350, h: 261, d: 1.4,
    image: '/play/designhero/poster.jpg',
    shots: HERO_SHOTS,
    startAt: 1,
  },
  ...HERO_CLIPS.map((clip) => ({
    id: clip.id,
    title: 'DESIGN HERO',
    description: 'Add a short description of this piece.',
    x: clip.x, y: clip.y, w: 350, h: 197, d: clip.d,
    video: `/play/designhero/${clip.file}-preview.mp4`,
    shots: HERO_SHOTS,
    startAt: HERO_FILM,
  })),
  {
    id: 'diner',
    title: 'DINER TYPEFACE',
    description: 'Add a short description of this piece.',
    x: 80, y: 1079, w: 350, h: 197, d: 1.1,
    video: '/play/type/diner-preview.mp4',
    shots: [{ src: '/play/type/diner.mp4', w: 1280, h: 920, video: true }],
  },
  {
    id: 'porcelain',
    title: 'PORCELAIN TYPEFACE',
    description: 'Add a short description of this piece.',
    x: 47, y: 637, w: 350, h: 197, d: 0.5,
    video: '/play/type/porcelain-preview.mp4',
    shots: [{ src: '/play/type/porcelain.mp4', w: 1280, h: 920, video: true }],
  },
  {
    id: 's3-package',
    title: 'S3 — HOME PACKAGE',
    description: 'Add a short description of this piece.',
    x: 138, y: 1525, w: 350, h: 232, d: 1.2,
    loop: S3_LOOP,
    // the same cadence as the Soundbox cycle
    loopMs: 1500,
    hardCut: true,
    shots: S3_LOOP.map((src) => still(src, 1600, 1060)),
  },
  {
    id: 's3-anim',
    title: 'S3',
    description: 'Add a short description of this piece.',
    x: 450, y: 1711, w: 350, h: 197, d: 1.5, z: 3,
    video: '/play/s3/animation-preview.mp4',
    // the box previews the animation; opening it plays the film
    shots: [{ src: '', w: 1280, h: 720, youtube: 'WDQaNn5ySwU' }],
  },
]

/** A drag further than this is a pan, not a click on a group. */
const CLICK_SLOP = 8

/**
 * Whether the device points rather than hovers. Read as external state so the
 * server renders the desktop wording and a hybrid that switches between a
 * trackpad and a touchscreen re-reads it.
 */
function useTouch() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(hover: none)')
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(hover: none)').matches,
    () => false
  )
}

// Fold an offset back into (-size, 0] so the 3x3 tiling always covers the screen.
const wrap = (value: number, size: number) => ((value % size) - size) % size

export default function Play() {
  const frame = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number } | null>(null)
  const parallax = useRef({ x: 0, y: 0 })
  const parallaxTo = useRef({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  // which group is open in the viewer, and where in it
  const [viewing, setViewing] = useState<{ g: number; i: number } | null>(null)
  // distance travelled since pointerdown, so a pan does not register as a click
  const moved = useRef(0)
  // what was under the pointer when it went down
  const downOn = useRef<string | null>(null)
  const scale = useRef(1)
  // there is nothing to scroll on a touchscreen, so say what the gesture is
  const touch = useTouch()

  // Fit the canvas to the screen, and open on the work rather than beside it.
  useEffect(() => {
    let opened = false
    const fit = () => {
      const small = window.innerWidth <= MOBILE_BREAKPOINT
      scale.current = small ? MOBILE_SCALE : 1
      // A desktop window opens on plenty of work already, so it keeps the view
      // it has always had. Only ever on the first pass either way: mobile
      // browsers fire resize whenever their chrome slides away, and re-centring
      // then would yank the canvas out from under whoever was mid-pan.
      if (opened || !small) return
      // the frame is the canvas's visible box, nav already subtracted
      const box = frame.current?.getBoundingClientRect()
      if (!box) return
      opened = true
      pos.current.x = box.width / 2 - FOCUS.x * scale.current
      pos.current.y = box.height / 2 - FOCUS.y * scale.current
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // Arrow keys page through the open group; Escape closes it.
  useEffect(() => {
    if (!viewing) return
    const total = groups[viewing.g].shots.length
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewing(null)
      if (e.key === 'ArrowRight')
        setViewing((v) => (v ? { ...v, i: (v.i + 1) % total } : v))
      if (e.key === 'ArrowLeft')
        setViewing((v) => (v ? { ...v, i: (v.i - 1 + total) % total } : v))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewing])

  // Single animation loop: integrates momentum and eases the cursor parallax,
  // writing straight to the DOM so React never re-renders mid-gesture.
  useEffect(() => {
    let raf = 0
    const step = () => {
      const el = canvas.current
      if (el) {
        if (!drag.current) {
          pos.current.x += vel.current.x
          pos.current.y += vel.current.y
        }
        vel.current.x *= FRICTION
        vel.current.y *= FRICTION
        if (Math.abs(vel.current.x) < 0.01) vel.current.x = 0
        if (Math.abs(vel.current.y) < 0.01) vel.current.y = 0

        parallax.current.x += (parallaxTo.current.x - parallax.current.x) * PARALLAX_EASE
        parallax.current.y += (parallaxTo.current.y - parallax.current.y) * PARALLAX_EASE

        // `translate` is read in screen pixels and `scale` applies to the
        // canvas's own contents, so the tiling repeats every scaled world.
        const s = scale.current
        el.style.transform = `translate3d(${wrap(
          pos.current.x,
          WORLD.width * s
        )}px, ${wrap(pos.current.y, WORLD.height * s)}px, 0) scale(${s})`
        el.style.setProperty('--px', parallax.current.x.toFixed(3))
        el.style.setProperty('--py', parallax.current.y.toFixed(3))
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Trackpad / wheel panning, fed in as impulses so it glides to a stop. The
  // listener has to be non-passive to stop a horizontal swipe navigating back.
  useEffect(() => {
    const el = frame.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      vel.current.x -= e.deltaX * WHEEL_IMPULSE
      vel.current.y -= e.deltaY * WHEEL_IMPULSE
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY }
    vel.current = { x: 0, y: 0 }
    moved.current = 0
    downOn.current =
      (e.target as HTMLElement).closest('[data-group]')?.getAttribute('data-group') ??
      null
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Items drift toward the cursor's side of the screen, scaled by their depth.
    const rect = e.currentTarget.getBoundingClientRect()
    parallaxTo.current = {
      x: (0.5 - (e.clientX - rect.left) / rect.width) * 2,
      y: (0.5 - (e.clientY - rect.top) / rect.height) * 2,
    }

    const start = drag.current
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    moved.current += Math.abs(dx) + Math.abs(dy)
    drag.current = { x: e.clientX, y: e.clientY }
    pos.current.x += dx
    pos.current.y += dy
    // Carried over on release to become the fling.
    vel.current = { x: dx, y: dy }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    drag.current = null
    setDragging(false)

    // A tap on a group opens it. This has to happen here rather than on the
    // box's own click handler: the frame captures the pointer on pointerdown,
    // so the click never reaches the element underneath.
    const id = downOn.current
    downOn.current = null
    if (!id || moved.current >= CLICK_SLOP) return
    const index = groups.findIndex((group) => group.id === id)
    if (index >= 0) setViewing({ g: index, i: groups[index].startAt ?? 0 })
  }

  const onPointerLeave = () => {
    parallaxTo.current = { x: 0, y: 0 }
  }

  return (
    <main className="main">
      {/* Nav */}
      <nav className="nav">
        <Link href="/" className="nav-name">YUER ZHU</Link>
        <div className="nav-links">
          <Link href="/">WORK</Link>
          <Link href="/play" className="is-active">PLAY</Link>
          <Link href="/about">ABOUT</Link>
        </div>
      </nav>

      {/* Pannable canvas */}
      <div
        ref={frame}
        className={`play${dragging ? ' is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <div ref={canvas} className="play-canvas">
          {TILES.map((col) =>
            TILES.map((row) => (
              <div
                key={`${col}:${row}`}
                className="play-tile"
                style={{
                  width: WORLD.width,
                  height: WORLD.height,
                  transform: `translate3d(${col * WORLD.width}px, ${row * WORLD.height}px, 0)`,
                }}
              >
                {groups.map((group) => (
                  <div
                    key={group.id}
                    data-group={group.id}
                    className="play-item"
                    style={
                      {
                        left: group.x,
                        top: group.y,
                        width: group.w,
                        zIndex: group.z ?? 4,
                        '--d': group.d,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="play-box"
                      style={{ height: group.h }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${group.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setViewing({
                            g: groups.indexOf(group),
                            i: group.startAt ?? 0,
                          })
                        }
                      }}
                    >
                      {group.video ? (
                        <video
                          src={group.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                        />
                      ) : group.image ? (
                        <Image
                          src={group.image}
                          alt=""
                          fill
                          sizes="400px"
                          loading="eager"
                          draggable={false}
                        />
                      ) : (
                        // Cycled by CSS rather than React: the canvas draws every
                        // box nine times over, and re-rendering all of it several
                        // times a second to advance a loop is wasted work.
                        group.loop!.map((src, i) => (
                          <Image
                            key={src}
                            // the animation's name carries the frame count, so
                            // each frame is up for exactly its share of the cycle
                            className={`play-frame play-frame--${
                              group.hardCut ? 'cut' : 'fade'
                            }-${group.loop!.length}`}
                            src={src}
                            alt=""
                            fill
                            sizes="460px"
                            // lazy loading leaves boxes blank: they sit outside
                            // the viewport inside a transformed canvas, so the
                            // browser never decides they came into view
                            loading="eager"
                            draggable={false}
                            style={{
                              animationDuration: `${
                                group.loopMs! * group.loop!.length
                              }ms`,
                              animationDelay: `-${group.loopMs! * i}ms`,
                            }}
                          />
                        ))
                      )}
                    </div>
                    <p className="play-caption">{group.title}</p>
                  </div>
                ))}

              </div>
            ))
          )}
        </div>
      </div>

      {/* the hint would show through the viewer's blur and collide with its caption */}
      {!viewing && (
        <p className="play-hint">
          {touch ? 'DRAG TO EXPLORE' : 'SCROLL / DRAG TO MOVE'}
        </p>
      )}

      {viewing && (
        <div
          className="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={groups[viewing.g].title}
          onClick={() => setViewing(null)}
        >
          <div className="viewer-stage" onClick={(e) => e.stopPropagation()}>
            {groups[viewing.g].shots[viewing.i].youtube ? (
              // YouTube's own player, controls included. Muted so it is allowed
              // to start; the viewer can turn the sound up from the bar.
              <div className="viewer-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${
                    groups[viewing.g].shots[viewing.i].youtube
                  }?autoplay=1&mute=1&controls=1&rel=0&playsinline=1`}
                  title={groups[viewing.g].title}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : groups[viewing.g].shots[viewing.i].vimeo ? (
              // Vimeo's own player, so it brings its controls with it. Muted so
              // it is allowed to start; the viewer can turn the sound up.
              <div className="viewer-embed">
                <iframe
                  src={`https://player.vimeo.com/video/${
                    groups[viewing.g].shots[viewing.i].vimeo
                  }?autoplay=1&muted=1&title=0&byline=0&portrait=0`}
                  title={groups[viewing.g].title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : groups[viewing.g].shots[viewing.i].video ? (
              // Opening the viewer is itself a click, so the browser lets this
              // start with sound. Controls give the viewer the volume back.
              <video
                key={groups[viewing.g].shots[viewing.i].src}
                className="viewer-image"
                src={groups[viewing.g].shots[viewing.i].src}
                controls
                autoPlay
                playsInline
                ref={(el) => {
                  if (!el) return
                  // Opening the viewer is itself a click, so a clip that has
                  // sound is allowed to start with it. The rest stay silent.
                  const withSound = groups[viewing.g].shots[viewing.i].sound
                  el.muted = !withSound
                  if (withSound) el.volume = 1
                  el.play().catch(() => {})
                }}
              />
            ) : (
              <Image
                className="viewer-image"
                src={groups[viewing.g].shots[viewing.i].src}
                width={groups[viewing.g].shots[viewing.i].w}
                height={groups[viewing.g].shots[viewing.i].h}
                sizes="90vw"
                priority
                alt={`${groups[viewing.g].title}, ${viewing.i + 1} of ${
                  groups[viewing.g].shots.length
                }`}
              />
            )}
          </div>

          <div className="viewer-caption">
            <p className="viewer-title">{groups[viewing.g].title}</p>
            <p className="viewer-description">{groups[viewing.g].description}</p>
            <p className="viewer-count">
              {viewing.i + 1} / {groups[viewing.g].shots.length}
            </p>
          </div>

          {groups[viewing.g].shots.length > 1 && (
          <>
          <button
            type="button"
            className="viewer-arrow viewer-arrow--prev"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation()
              const total = groups[viewing.g].shots.length
              setViewing((v) => (v ? { ...v, i: (v.i - 1 + total) % total } : v))
            }}
          >
            PREVIOUS
          </button>
          <button
            type="button"
            className="viewer-arrow viewer-arrow--next"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation()
              const total = groups[viewing.g].shots.length
              setViewing((v) => (v ? { ...v, i: (v.i + 1) % total } : v))
            }}
          >
            NEXT
          </button>
          </>
          )}
        </div>
      )}

    </main>
  )
}
