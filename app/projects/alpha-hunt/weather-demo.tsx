// Access weather data, running.
//
// The whole way in and back out again: the quick-weather chip is tapped, the
// home screen's controls clear off and the map-layer button takes their place,
// the weather sheet comes up, is pulled to full height and scrolled behind its
// own fixed top group, dropped back to half, pointed at another town, and then
// set to the wind layer before the sheet is closed and the home screen comes
// back.
//
// The map and the wind layer carry names of their own rather than being
// written over earlier files: this project's image optimiser keeps serving the
// previous bytes for a path whose file has changed underneath it.
//
// Built the way the other panels on this page are: everything is placed in the
// artwork's own 375 x 815 pixels, --u is one of them, and a loop writes the
// figures below onto the stage as custom properties rather than through React.
// The round buttons are cut from the mocks as circles so each keeps the
// frosted blur it was drawn with, and the sheet's top group is rebuilt in CSS
// because the town's name has to change inside it.
'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

// Where the sheet's top edge sits: off the bottom, half way, and open.
const SHEET_GONE = 815
const SHEET_MID = 445
const SHEET_FULL = 52

// How far the panel runs up behind the top group: all the way to its foot.
const SCROLL_END = 1750

// It gets there in steps, each about a screenful and then a pause, the way a
// thumb works down a long page rather than in one unbroken sweep. Each run
// picks up where the one before it stopped, so nothing is read twice.
const STEPS = 3
const STEP_MOVE = 1.35
const STEP_HOLD = 0.5

// The filmstrip the map travels along when the town changes: five panels, and
// the last is where it comes to rest.
const PANELS = 5

// Seconds, in the order they happen.
const SETTLE = 0.55
const TO_CHIP = 0.6
const TAP_CHIP = 0.3
const SWAP = 0.75
const READ = 0.5
const TO_GRAB = 0.45
const PULL_UP = 0.65
const REST_FULL = 1.0
const SCROLL = STEPS * (STEP_MOVE + STEP_HOLD)
const REST_SCROLL = 0.5
const PULL_DOWN = 0.6
const TO_DOTS = 0.5
const TAP_DOTS = 0.3
const PLACES_IN = 0.4
const TO_TOWN = 0.5
const TAP_TOWN = 0.32
const SHIFT_MAP = 0.85
const REST_PLACE = 0.6
const TO_TYPES = 0.55
const TAP_TYPES = 0.3
const TYPES_IN = 0.4
const TO_WIND = 0.45
const TAP_WIND = 0.32
const WIND_IN = 0.9
const REST_WIND = 1.1
const TO_CLOSE = 0.5
const TAP_CLOSE = 0.3
const OUT = 0.8
const DONE = 0.7

type Point = { x: number; y: number }

// Where the hand goes. The picture's own fingertip sits 16 to the right of its
// centre and 39 above it, so a point here is the hand's middle rather than the
// tip: to put the tip on something, come left and down from it.
const OFF: Point = { x: 420, y: 900 }
const CHIP_TAP: Point = { x: 40, y: 147 }
const GRAB_TAP: Point = { x: 188, y: 470 }
const GRAB_END: Point = { x: 188, y: 120 }
const SWIPE_END: Point = { x: 188, y: 440 }
const DOTS_TAP: Point = { x: 26, y: 480 }
const TOWN_TAP: Point = { x: 164, y: 466 }
const TYPES_TAP: Point = { x: 337, y: 80 }
const WIND_TAP: Point = { x: 194, y: 134 }
const CLOSE_TAP: Point = { x: 349, y: 480 }

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const between = (a: Point, b: Point, p: number) => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
})

type Phase =
  | 'settle' | 'toChip' | 'tapChip' | 'swap' | 'read'
  | 'toGrab' | 'pullUp' | 'restFull' | 'scroll' | 'restScroll' | 'pullDown'
  | 'toDots' | 'tapDots' | 'placesIn' | 'toTown' | 'tapTown' | 'shiftMap' | 'restPlace'
  | 'toTypes' | 'tapTypes' | 'typesIn' | 'toWind' | 'tapWind' | 'windIn' | 'restWind'
  | 'toClose' | 'tapClose' | 'out' | 'done'

const RUNS: Record<Phase, number> = {
  settle: SETTLE, toChip: TO_CHIP, tapChip: TAP_CHIP, swap: SWAP, read: READ,
  toGrab: TO_GRAB, pullUp: PULL_UP, restFull: REST_FULL, scroll: SCROLL,
  restScroll: REST_SCROLL, pullDown: PULL_DOWN,
  toDots: TO_DOTS, tapDots: TAP_DOTS, placesIn: PLACES_IN, toTown: TO_TOWN,
  tapTown: TAP_TOWN, shiftMap: SHIFT_MAP, restPlace: REST_PLACE,
  toTypes: TO_TYPES, tapTypes: TAP_TYPES, typesIn: TYPES_IN, toWind: TO_WIND,
  tapWind: TAP_WIND, windIn: WIND_IN, restWind: REST_WIND,
  toClose: TO_CLOSE, tapClose: TAP_CLOSE, out: OUT, done: DONE,
}

const NEXT: Record<Phase, Phase> = {
  settle: 'toChip', toChip: 'tapChip', tapChip: 'swap', swap: 'read', read: 'toGrab',
  toGrab: 'pullUp', pullUp: 'restFull', restFull: 'scroll', scroll: 'restScroll',
  restScroll: 'pullDown', pullDown: 'toDots', toDots: 'tapDots', tapDots: 'placesIn',
  placesIn: 'toTown', toTown: 'tapTown', tapTown: 'shiftMap', shiftMap: 'restPlace',
  restPlace: 'toTypes', toTypes: 'tapTypes', tapTypes: 'typesIn', typesIn: 'toWind',
  toWind: 'tapWind', tapWind: 'windIn', windIn: 'restWind', restWind: 'toClose',
  toClose: 'tapClose', tapClose: 'out', out: 'done', done: 'settle',
}

export default function WeatherDemo() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let phase: Phase = 'settle'
    let started = 0
    let raf = 0
    let running = false

    const write = (k: string, v: number) => stage.style.setProperty(k, String(v))

    const draw = (now: number) => {
      const p = clamp((now - started) / (RUNS[phase] * 1000))
      const e = ease(p)

      // what has already happened by the time each phase runs
      const open = ['swap', 'read', 'toGrab', 'pullUp', 'restFull', 'scroll',
        'restScroll', 'pullDown', 'toDots', 'tapDots', 'placesIn', 'toTown',
        'tapTown', 'shiftMap', 'restPlace', 'toTypes', 'tapTypes', 'typesIn',
        'toWind', 'tapWind', 'windIn', 'restWind', 'toClose', 'tapClose']
      const isOpen = open.includes(phase)

      // ── the sheet ──
      let sheet = SHEET_GONE
      if (phase === 'swap') sheet = SHEET_GONE + (SHEET_MID - SHEET_GONE) * e
      else if (phase === 'pullUp') sheet = SHEET_MID + (SHEET_FULL - SHEET_MID) * e
      else if (['restFull', 'scroll', 'restScroll'].includes(phase)) sheet = SHEET_FULL
      else if (phase === 'pullDown') sheet = SHEET_FULL + (SHEET_MID - SHEET_FULL) * e
      else if (phase === 'out') sheet = SHEET_MID + (SHEET_GONE - SHEET_MID) * e
      else if (isOpen) sheet = SHEET_MID
      write('--sheet', sheet)

      // ── the panel behind the top group ──
      let scroll = 0
      if (phase === 'scroll') {
        // which step is running, and how far into its own run it is
        const span = STEP_MOVE + STEP_HOLD
        const t = p * SCROLL
        const k = Math.min(STEPS - 1, Math.floor(t / span))
        const into = t - k * span
        scroll = (SCROLL_END / STEPS) * (k + (into <= STEP_MOVE ? ease(into / STEP_MOVE) : 1))
      }
      // Held from here on: dropping the sheet to half height leaves the
      // forecast where the reader left it rather than snapping it back.
      else if (['restScroll', 'pullDown', 'toDots', 'tapDots', 'placesIn',
        'toTown', 'tapTown', 'shiftMap', 'restPlace', 'toTypes', 'tapTypes',
        'typesIn', 'toWind', 'tapWind', 'windIn', 'restWind', 'toClose',
        'tapClose'].includes(phase)) scroll = SCROLL_END
      write('--scroll', scroll)

      // ── the home screen's own controls, and the layer button that replaces them ──
      let home = 1
      if (phase === 'swap') home = 1 - e
      else if (isOpen) home = 0
      else if (phase === 'out') home = e
      else if (phase === 'done') home = 1
      write('--home', home)

      // ── the chip's run from the corner to the middle of the map ──
      let chip = 0
      if (phase === 'swap') chip = e
      else if (isOpen) chip = 1
      else if (phase === 'out') chip = 1 - e
      write('--chip', chip)

      // ── the two menus ──
      write('--places', phase === 'placesIn' ? e
        : ['toTown', 'tapTown'].includes(phase) ? 1
        : phase === 'shiftMap' ? 1 - clamp(e * 2.4) : 0)
      write('--types', phase === 'typesIn' ? e
        : ['toWind', 'tapWind'].includes(phase) ? 1
        : phase === 'windIn' ? 1 - clamp(e * 2.4) : 0)

      // ── the map: where it is, and which layer is on it ──
      const moved = ['shiftMap', 'restPlace', 'toTypes', 'tapTypes', 'typesIn',
        'toWind', 'tapWind', 'windIn', 'restWind', 'toClose', 'tapClose', 'out']
      // Run hard and settle: the places between are only ever a blur going past.
      const flight = phase === 'shiftMap' ? 1 - Math.pow(1 - p, 3) : moved.includes(phase) ? 1 : 0
      write('--fly', (PANELS - 1) * flight)
      write('--place', phase === 'shiftMap' ? clamp((e - 0.35) / 0.3) : moved.includes(phase) ? 1 : 0)
      write('--wind', phase === 'windIn' ? e
        : ['restWind', 'toClose', 'tapClose'].includes(phase) ? 1
        : phase === 'out' ? 1 - e : 0)

      // ── the hand ──
      let hand = 0
      let at2: Point = OFF
      let tap = 1
      if (phase === 'toChip') { hand = e; at2 = between(OFF, CHIP_TAP, e) }
      else if (phase === 'tapChip') { hand = 1; at2 = CHIP_TAP; tap = 1 - 0.14 * Math.sin(p * Math.PI) }
      else if (phase === 'swap') { hand = 1 - clamp(e * 1.6); at2 = CHIP_TAP }
      else if (phase === 'toGrab') { hand = e; at2 = between(OFF, GRAB_TAP, e) }
      else if (phase === 'pullUp') { hand = 1; at2 = between(GRAB_TAP, GRAB_END, e) }
      else if (phase === 'restFull') { hand = 1 - e; at2 = GRAB_END }
      else if (phase === 'scroll') {
        // one swipe per step, lifted away again while the page is being read
        const span = STEP_MOVE + STEP_HOLD
        const t = p * SCROLL
        const into = t - Math.min(STEPS - 1, Math.floor(t / span)) * span
        const run = clamp(into / STEP_MOVE)
        hand = into <= STEP_MOVE ? 1 : clamp(1 - (into - STEP_MOVE) / 0.18)
        at2 = between({ x: 188, y: 560 }, { x: 188, y: 300 }, ease(run))
      }
      else if (phase === 'restScroll') { hand = 0; at2 = { x: 188, y: 300 } }
      else if (phase === 'pullDown') { hand = 1; at2 = between(GRAB_END, SWIPE_END, e) }
      else if (phase === 'toDots') { hand = e; at2 = between(SWIPE_END, DOTS_TAP, e) }
      else if (phase === 'tapDots') { hand = 1; at2 = DOTS_TAP; tap = 1 - 0.14 * Math.sin(p * Math.PI) }
      else if (phase === 'placesIn') { hand = 1; at2 = DOTS_TAP }
      else if (phase === 'toTown') { hand = 1; at2 = between(DOTS_TAP, TOWN_TAP, e) }
      else if (phase === 'tapTown') { hand = 1; at2 = TOWN_TAP; tap = 1 - 0.14 * Math.sin(p * Math.PI) }
      else if (phase === 'shiftMap') { hand = 1 - clamp(e * 1.6); at2 = TOWN_TAP }
      else if (phase === 'toTypes') { hand = e; at2 = between(OFF, TYPES_TAP, e) }
      else if (phase === 'tapTypes') { hand = 1; at2 = TYPES_TAP; tap = 1 - 0.14 * Math.sin(p * Math.PI) }
      else if (phase === 'typesIn') { hand = 1; at2 = TYPES_TAP }
      else if (phase === 'toWind') { hand = 1; at2 = between(TYPES_TAP, WIND_TAP, e) }
      else if (phase === 'tapWind') { hand = 1; at2 = WIND_TAP; tap = 1 - 0.14 * Math.sin(p * Math.PI) }
      else if (phase === 'windIn') { hand = 1 - clamp(e * 1.6); at2 = WIND_TAP }
      else if (phase === 'toClose') { hand = e; at2 = between(OFF, CLOSE_TAP, e) }
      else if (phase === 'tapClose') { hand = 1; at2 = CLOSE_TAP; tap = 1 - 0.14 * Math.sin(p * Math.PI) }
      else if (phase === 'out') { hand = 1 - clamp(e * 1.6); at2 = CLOSE_TAP }
      write('--hand', hand)
      write('--hx', at2.x)
      write('--hy', at2.y)
      write('--tap', tap)

      if (p >= 1) {
        phase = NEXT[phase]
        started = now
      }
      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running) return
      running = true
      started = performance.now()
      raf = requestAnimationFrame(draw)
    }
    const stop = () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    // It runs while it is being looked at, and stops when it is not.
    const eye = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.3 },
    )
    eye.observe(stage)
    return () => {
      eye.disconnect()
      stop()
    }
  }, [])

  const stage = {
    '--sheet': SHEET_GONE, '--scroll': 0, '--home': 1, '--chip': 0,
    '--places': 0, '--types': 0, '--fly': 0, '--place': 0, '--wind': 0,
    '--hand': 0, '--hx': OFF.x, '--hy': OFF.y, '--tap': 1,
  } as CSSProperties

  return (
    <figure className="ranging-demo wx-demo">
      <div className="ranging-stage wx-stage" ref={stageRef} style={stage}>
        {/* the map, and the wind layer that comes over it */}
        <Image className="wx-terrain" src="/projects/alpha-wx-fields-strip.jpg" alt="" width={3750} height={1630} />
        <Image className="wx-wind" src="/projects/alpha-wx-windfield.jpg" alt="" width={750} height={1630} />

        {/* the phone's own top edge */}
        <div className="aap-island" />
        <Image className="wx-status" src="/projects/alpha-wx-status.png" alt="" width={690} height={64} />

        {/* What the home screen carries, all of which clears off together. Each
            control is frosted glass built in CSS with its own line work laid
            over it, rather than a picture of a button: the glass has to blur
            whatever map happens to be running behind it. */}
        <Image className="wx-home wx-avatar" src="/projects/alpha-wx-avatar.png" alt="" width={82} height={80} />
        <span className="wx-home wx-glass wx-search" />
        <Image className="wx-home wx-ink wx-search" src="/projects/alpha-wx-ink-search.png" alt="" width={84} height={84} />
        <span className="wx-home wx-glass wx-device" />
        <Image className="wx-home wx-ink wx-device" src="/projects/alpha-wx-ink-device.png" alt="" width={84} height={84} />
        <span className="wx-home wx-glass wx-locate" />
        <Image className="wx-home wx-ink wx-locate" src="/projects/alpha-wx-ink-locate.png" alt="" width={76} height={76} />
        <span className="wx-home wx-glass wx-td" />
        <Image className="wx-home wx-ink wx-td" src="/projects/alpha-wx-ink-3d.png" alt="" width={76} height={76} />
        <span className="wx-home wx-pill wx-tabbar" />
        <Image className="wx-home wx-ink wx-tabbar" src="/projects/alpha-wx-ink-tabbar.png" alt="" width={726} height={128} />

        {/* and what takes their place */}
        <span className="wx-glass wx-layers" />
        <Image className="wx-ink wx-layers" src="/projects/alpha-wx-ink-layers.png" alt="" width={82} height={82} />

        {/* the quick-weather chip, which travels from the corner to the map */}
        <Image className="wx-chip" src="/projects/alpha-wx-chip-dark.png" alt="" width={112} height={150} />

        {/* the sheet: the panel runs up behind a top group that stays put */}
        <div className="wx-sheet">
          <Image className="wx-panel" src="/projects/alpha-wx-panel.jpg" alt="" width={750} height={4836} />
          <div className="wx-top">
            <span className="wx-grab" />
            <span className="wx-dots" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="wx-title">
              <b className="wx-town wx-town--here">Olathe, KS</b>
              <b className="wx-town wx-town--there">Quincy, IL</b>
              <em>Updated 1 hour ago</em>
            </span>
            <span className="wx-close" aria-hidden="true" />
            <span className="wx-field">Search</span>
          </div>
        </div>

        {/* the menus, each over everything else while it is up */}
        <div className="wx-menu wx-menu--places">
          <Image src="/projects/alpha-wx-places.png" alt="" width={702} height={790} />
        </div>
        <div className="wx-menu wx-menu--types">
          <Image src="/projects/alpha-wx-types.png" alt="" width={702} height={668} />
        </div>

        <Image className="ranging-hand" src="/projects/alpha-tap-hint.png" alt="" width={142} height={142} />
      </div>
    </figure>
  )
}
