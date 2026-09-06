// Navigate, running.
//
// The five Navigate mocks are one walk told in five stops: the map at rest, the
// waypoint list open, the bearing to the truck drawn as an angle off the sight
// line, that angle closed, and the walk in until the truck is underfoot. This
// plays the walk between them.
//
// One number does most of the work. `heading` is where the walker is facing;
// the truck sits at a fixed bearing, so the difference between them is the
// deviation, and everything that shrinks — the angle on the map, the bar on the
// compass tape, the gap between the tape's centre and the truck's marker — is
// that one difference drawn three ways. Turning the walker turns the map under
// them, so the map's own rotation comes off the same number too.
//
// The mocks are 375 x 815, so the stylesheet works in those pixels: --u is one
// of them, and every offset below was measured off the artwork. The mocks hold
// the map still; this does not, so the map is opened up enough to have somewhere
// to turn into and somewhere to walk through.
'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

import CompassTape, { PER_DEG } from './compass-tape'

// The sight line, and the walker standing on it. Everything turns about the
// walker, because that is what turning on your feet does to the world. The
// bearing line shares the sight line's axis exactly, so that once the two agree
// the orange covers the dashes rather than sitting beside them.
const AXIS = 189.5
const USER = { x: AXIS, y: 648 }

// The truck's bearing, and where the walker starts out facing. The difference
// puts the truck's marker 116 pixels right of centre on the tape, which is
// where the mock has it.
const BEARING = 150
const START = 72.7

// The angle drawn on the map is the designer's, not the arithmetic's: the mock
// opens it 28.6 degrees off the sight line however far the heading is out.
const SPREAD = 28.6

// The map is opened to 1.78 (the stylesheet holds that, along with the shift
// that goes with it) so that it has room to swing and then to run. It starts
// pushed up 86 pixels rather than centred, which is what keeps the zoom this
// low: centred, the walk could only use the map above the walker, and 1.78
// would not have been enough to both turn 16 degrees without pulling a corner
// into frame and still slide the 590 pixels the truck is away.
const SWING = 16
const REACH = 590

// The rungs and their labels, which do not change here.
const RUNGS = [137, 284, 431, 579]
const RUNG_FEET = [68, 58, 48, 38]

const MILES = 3.1

// Seconds, in the order they happen.
const SETTLE = 0.4
const REACH_LIST = 0.7
const TAP = 0.28
const OPEN = 0.3
const TO_ROW = 0.6
const PICK = 0.28
const READ = 0.45
const SHUT = 0.3
const ARM = 0.4
const TURN = 2.9
const LINE_UP = 0.4
const WALK = 4
const ARRIVED = 1.6

type Point = { x: number; y: number }

// Where the fingertip goes: the list button, then the Truck row in the menu.
const OFF = { x: 320, y: 900 }
const LIST = { x: 345, y: 661 }
const ROW = { x: 210, y: 285 }

// The hand is drawn 112.5 wide and points from 70, 34 of its own 142 square.
const FINGER = { x: 0.79, y: 29.31 }

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const between = (a: Point, b: Point, p: number) => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
})
const at = (v: number) => ({ '--at': v }) as CSSProperties

type Phase =
  | 'settle' | 'reach' | 'tap' | 'open' | 'toRow' | 'pick' | 'read' | 'shut'
  | 'arm' | 'turn' | 'lineUp' | 'walk' | 'arrived'

export default function NavigateDemo() {
  const stageRef = useRef<HTMLDivElement>(null)
  const wedgeRef = useRef<SVGPolygonElement>(null)
  const rayRef = useRef<SVGLineElement>(null)
  const headRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const wedge = wedgeRef.current
    const ray = rayRef.current
    if (!stage || !wedge || !ray) return

    // close: 0 with the angle wide open, 1 with it shut. walk: 0 at the start
    // of the walk, 1 standing on the truck.
    let close = 0
    let walk = 0
    let menu = 0
    let tick = 0
    let gear = 0
    let press = 1
    let tap = 1
    let hand = 0
    let hint: Point = OFF
    let said = ''

    const write = () => {
      const heading = START + (BEARING - START) * close
      const off = BEARING - heading
      const spread = SPREAD * (1 - close)
      const pan = REACH * walk

      const set = (name: string, value: number, places = 3) =>
        stage.style.setProperty(`--${name}`, value.toFixed(places))
      set('spin', SWING * (1 - close), 2)
      set('pan', pan, 2)
      set('tape', AXIS - heading * PER_DEG, 2)
      set('dev', off * PER_DEG, 2)
      set('menu', menu)
      set('tick', tick)
      set('gear', gear)
      set('press', press)
      set('tap', tap)
      set('hand', hand)
      set('hx', hint.x + FINGER.x, 2)
      set('hy', hint.y + FINGER.y, 2)

      // The angle, and the truck sitting on the far end of its open side.
      const rad = (spread * Math.PI) / 180
      const far = { x: USER.x + 1200 * Math.sin(rad), y: USER.y - 1200 * Math.cos(rad) }
      wedge.setAttribute(
        'points',
        `${USER.x},${USER.y} ${USER.x},${USER.y - 1200} ${far.x.toFixed(1)},${far.y.toFixed(1)}`,
      )
      ray.setAttribute('x2', far.x.toFixed(1))
      ray.setAttribute('y2', far.y.toFixed(1))
      set('tx', USER.x + REACH * Math.sin(rad), 2)
      set('ty', USER.y - REACH * Math.cos(rad) + pan, 2)

      // The header counts the walk down, and the arrival takes over from it
      // over the last of the walk rather than snapping.
      const label = `Truck • ${(MILES * (1 - walk)).toFixed(1)} mi`
      if (label !== said) {
        said = label
        if (headRef.current) headRef.current.textContent = label
      }
      set('home', clamp((walk - 0.9) / 0.1))
    }

    // Nothing moves for a reader who has asked for that. They get the last of
    // the five screens: lined up, walked in, arrived.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      close = 1; walk = 1; gear = 1
      write()
      return
    }

    let frame = 0
    let phase: Phase = 'settle'
    let since = performance.now()
    const enter = (next: Phase, now: number) => {
      phase = next
      since = now
    }

    const step = (now: number) => {
      const t = (now - since) / 1000

      if (phase === 'settle') {
        if (t >= SETTLE) enter('reach', now)
      } else if (phase === 'reach') {
        const p = clamp(t / REACH_LIST)
        hint = between(OFF, LIST, ease(p))
        hand = clamp(t / 0.3)
        if (p === 1) enter('tap', now)
      } else if (phase === 'tap') {
        const p = clamp(t / TAP)
        hint = LIST
        tap = 1 - 0.11 * Math.sin(Math.PI * p)
        press = 1 - 0.07 * Math.sin(Math.PI * p)
        menu = clamp((p - 0.5) / 0.5)
        if (p === 1) enter('open', now)
      } else if (phase === 'open') {
        tap = 1; press = 1
        menu = 1
        if (t >= OPEN) enter('toRow', now)
      } else if (phase === 'toRow') {
        const p = clamp(t / TO_ROW)
        hint = between(LIST, ROW, ease(p))
        if (p === 1) enter('pick', now)
      } else if (phase === 'pick') {
        const p = clamp(t / PICK)
        hint = ROW
        tap = 1 - 0.11 * Math.sin(Math.PI * p)
        // the tick lands as the finger bottoms out
        tick = clamp((p - 0.45) / 0.35)
        if (p === 1) enter('read', now)
      } else if (phase === 'read') {
        tap = 1; tick = 1
        if (t >= READ) enter('shut', now)
      } else if (phase === 'shut') {
        // picking it is the whole answer, so the menu goes as soon as it is read
        const p = clamp(t / SHUT)
        menu = 1 - p
        hand = 1 - p
        if (p === 1) { menu = 0; tick = 0; hand = 0; hint = OFF; enter('arm', now) }
      } else if (phase === 'arm') {
        // the bearing arrives: the header, the angle on the map, the bar on the tape
        gear = clamp(t / ARM)
        if (t >= ARM) enter('turn', now)
      } else if (phase === 'turn') {
        gear = 1
        close = ease(clamp(t / TURN))
        if (t >= TURN) enter('lineUp', now)
      } else if (phase === 'lineUp') {
        gear = 1; close = 1
        if (t >= LINE_UP) enter('walk', now)
      } else if (phase === 'walk') {
        gear = 1; close = 1
        walk = ease(clamp(t / WALK))
        if (t >= WALK) enter('arrived', now)
      } else {
        gear = 1; close = 1; walk = 1
        // a beat standing on the truck, then a straight cut back to the start
        if (t >= ARRIVED) {
          close = 0; walk = 0; menu = 0; tick = 0; gear = 0
          hand = 0; tap = 1; press = 1; hint = OFF
          enter('settle', now)
        }
      }

      write()
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <figure className="nav-demo">
      <div className="nav-stage" ref={stageRef}>
        <Image
          className="nav-map"
          src="/projects/alpha-nav-map.jpg"
          alt=""
          width={750}
          height={1630}
          sizes="(max-width: 768px) 70vw, 320px"
        />

        {/* The angle between where the walker is looking and where the truck
            is, the sight line it is measured from, and the bearing line down
            its open side. All three are drawn in one coordinate system so that
            once the bearing agrees with the sight line the orange lands exactly
            on the dashes and covers them, rather than beside them. */}
        <svg className="nav-angle" viewBox="0 0 375 815" aria-hidden="true">
          <polygon
            ref={wedgeRef}
            className="nav-wedge"
            fill="rgba(255, 117, 56, 0.5)"
            points="0,0 0,0 0,0"
          />
          <line
            x1={AXIS}
            y1={44}
            x2={AXIS}
            y2={645}
            stroke="rgba(255, 255, 255, 0.88)"
            strokeWidth="3"
            strokeDasharray="8 8"
          />
          <line
            ref={rayRef}
            className="nav-ray"
            x1={USER.x}
            y1={USER.y}
            x2={USER.x}
            y2={USER.y}
            stroke="#ff7538"
            strokeWidth="3"
          />
        </svg>

        <Image className="nav-truck" src="/projects/alpha-nav-truck.png" alt="" width={33} height={46} />

        {RUNGS.map((y) => (
          <div className="nav-rung" key={y} style={at(y)}>
            <span className="nav-rung-hair" />
            <span className="nav-rung-bar nav-rung-bar--l" />
            <span className="nav-rung-bar nav-rung-bar--r" />
          </div>
        ))}

        <Image
          className="nav-chrome"
          src="/projects/alpha-nav-chrome.png"
          alt=""
          width={375}
          height={815}
          sizes="(max-width: 768px) 70vw, 320px"
        />

        {RUNGS.map((y, i) => (
          <div className="nav-tag" key={y} style={at(y)}>
            {RUNG_FEET[i]} ft
          </div>
        ))}

        <Image
          className="nav-user"
          src="/projects/alpha-ranging-user.png"
          alt=""
          width={54}
          height={64}
        />

        {/* The compass tape, with the two things this panel pins to it: how
            far off the heading is, drawn from the centre out to the truck's own
            marker, and the marker itself. The chevrons keep their size and are
            cut off as the bar closes. */}
        <CompassTape>
          <span className="nav-bar" />
          <Image
            className="nav-flag"
            src="/projects/alpha-nav-truck.png"
            alt=""
            width={33}
            height={46}
          />
        </CompassTape>

        <div className="nav-head">
          <span ref={headRef}>Truck • {MILES.toFixed(1)} mi</span>
        </div>
        <div className="nav-home">Arrived</div>

        <Image
          className="nav-list"
          src="/projects/alpha-nav-list.png"
          alt=""
          width={38}
          height={38}
        />

        {/* The waypoint list, and the tick that lands on Truck when it is
            picked — the artwork's own tick is painted out so this one can
            arrive rather than already be there. */}
        <Image
          className="nav-menu"
          src="/projects/alpha-nav-menu.png"
          alt=""
          width={330}
          height={549}
          sizes="(max-width: 768px) 62vw, 285px"
        />
        <svg className="nav-tick-mark" viewBox="0 0 14 16" aria-hidden="true">
          <path
            d="M1 8.5 L5 13 L13 3"
            fill="none"
            stroke="#1c1c1c"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <Image
          className="nav-hand"
          src="/projects/alpha-tap-hint.png"
          alt=""
          width={142}
          height={142}
          sizes="(max-width: 768px) 24vw, 110px"
        />
      </div>
    </figure>
  )
}
