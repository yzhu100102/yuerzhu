// Additional access points, running.
//
// The tools are not only for where you are standing. This plays the way into
// them from a saved place: the map is panned until more waypoints come into
// view, one is tapped, its sheet comes up and is scrolled, and the range tool
// is opened from inside it — anchored on the waypoint rather than on the walker.
//
// The screen's furniture is rebuilt rather than pasted: the round buttons and
// the tab bar are real frosted glass in CSS, so the map stays live behind them
// as it moves. Only the black line work on top of that glass, and the white type
// in the status bar, are lifted from the mocks.
//
// Everything is placed in the artwork's own 375 x 815 pixels; --u is one of them.
'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

// The map is opened to 1.55 and starts pushed right, which gives it the 190
// pixels of itself it has to travel through: 140 to bring the far waypoints in,
// then 50 more to carry the tapped one to the top of what is left of the map.
const PAN_ONE = { x: -140, y: -55 }
const PAN_TWO = { x: -50, y: -91 }

// The waypoints, in map pixels — where each sits before any of it moves. The
// last three start off the right-hand edge and are what panning brings in.
const PINS = [
  { key: 'water', src: '/projects/alpha-aap-water.png', x: 221, y: 234 },
  { key: 'deer', src: '/projects/alpha-aap-deer.png', x: 176, y: 617 },
  { key: 'tent', src: '/projects/alpha-aap-tent.png', x: 364, y: 293 },
  { key: 'tree', src: '/projects/alpha-aap-tree.png', x: 454, y: 463 },
  { key: 'paw', src: '/projects/alpha-aap-paw.png', x: 385, y: 748 },
]

// The sheet: off the bottom, then up to where it first rests, then up again as
// it is dragged. Its own top group stays put and the panel runs behind it.
const SHEET_GONE = 815
const SHEET_REST = 255
const SHEET_FULL = 52
const SCROLL_END = 263

// The range tool's own graduations, which is the screen the mock ends on.
const RUNGS = [137, 284, 431, 579]
const RUNG_YARDS = [43, 33, 23, 13]

// Half the turn the tool's map makes once it is open.
const SPIN = 7

// Seconds, in the order they happen.
const SETTLE = 0.4
const TO_MAP = 0.6
const PAN = 1.2
const LIFT = 0.25
const TO_PIN = 0.55
const TAP_PIN = 0.28
const SHEET_IN = 0.7
const READ = 0.45
const TO_SHEET = 0.45
const SCROLL = 1.3
const REST = 0.35
const TAP_TOOL = 0.32
const TOOL_IN = 0.65
const TURN = 1.35
const DONE = 0.7

type Point = { x: number; y: number }

// Where the fingertip goes.
const OFF = { x: 420, y: 900 }
const GRAB = { x: 300, y: 480 }
const TENT_TAP = { x: 245, y: 250 }
const SHEET_GRAB = { x: 150, y: 700 }
const TOOL_TAP = { x: 140, y: 631 }

// The hand is drawn 112.5 wide and points from 70, 34 of its own 142 square.
const FINGER = { x: 0.79, y: 29.31 }

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const between = (a: Point, b: Point, p: number) => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
})
const rowAt = (v: number) => ({ '--y': v }) as CSSProperties
const pinAt = (x: number, y: number) => ({ '--px': x, '--py': y }) as CSSProperties

type Phase =
  | 'settle' | 'toMap' | 'pan' | 'lift' | 'toPin' | 'tapPin' | 'sheetIn'
  | 'read' | 'toSheet' | 'scroll' | 'rest' | 'tapTool' | 'toolIn'
  | 'turnOut' | 'turnBack' | 'done'

export default function AccessDemo() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let pan: Point = { x: 0, y: 0 }
    let sheet = SHEET_GONE
    let scroll = 0
    let tool = 0
    let spin = SPIN
    let press = 1
    let tap = 1
    let hand = 0
    let at: Point = OFF

    const write = () => {
      const set = (name: string, value: number, places = 2) =>
        stage.style.setProperty(`--${name}`, value.toFixed(places))
      set('mx', pan.x)
      set('my', pan.y)
      set('sheet', sheet)
      set('scroll', scroll)
      set('tool', tool, 3)
      set('spin', spin)
      set('press', press, 3)
      set('tap', tap, 3)
      set('hand', hand, 3)
      set('hx', at.x + FINGER.x)
      set('hy', at.y + FINGER.y)
    }

    // Nothing moves for a reader who has asked for that: the tool, open on the
    // waypoint, which is where the sequence was going.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pan = { x: PAN_ONE.x + PAN_TWO.x, y: PAN_ONE.y + PAN_TWO.y }
      sheet = SHEET_FULL
      scroll = SCROLL_END
      tool = 1
      spin = 0
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
        if (t >= SETTLE) enter('toMap', now)
      } else if (phase === 'toMap') {
        const p = clamp(t / TO_MAP)
        at = between(OFF, GRAB, ease(p))
        hand = clamp(t / 0.3)
        if (p === 1) enter('pan', now)
      } else if (phase === 'pan') {
        // the map goes with the finger, one pixel for one pixel
        const p = ease(clamp(t / PAN))
        pan = { x: PAN_ONE.x * p, y: PAN_ONE.y * p }
        at = { x: GRAB.x + PAN_ONE.x * p, y: GRAB.y + PAN_ONE.y * p }
        if (t >= PAN) enter('lift', now)
      } else if (phase === 'lift') {
        if (t >= LIFT) enter('toPin', now)
      } else if (phase === 'toPin') {
        const p = clamp(t / TO_PIN)
        at = between({ x: GRAB.x + PAN_ONE.x, y: GRAB.y + PAN_ONE.y }, TENT_TAP, ease(p))
        if (p === 1) enter('tapPin', now)
      } else if (phase === 'tapPin') {
        const p = clamp(t / TAP_PIN)
        at = TENT_TAP
        tap = 1 - 0.11 * Math.sin(Math.PI * p)
        if (p === 1) enter('sheetIn', now)
      } else if (phase === 'sheetIn') {
        // the sheet comes up and the map carries the waypoint above it
        const p = ease(clamp(t / SHEET_IN))
        tap = 1
        sheet = SHEET_GONE + (SHEET_REST - SHEET_GONE) * p
        pan = { x: PAN_ONE.x + PAN_TWO.x * p, y: PAN_ONE.y + PAN_TWO.y * p }
        hand = 1 - clamp(t / (SHEET_IN * 0.6))
        if (t >= SHEET_IN) enter('read', now)
      } else if (phase === 'read') {
        if (t >= READ) enter('toSheet', now)
      } else if (phase === 'toSheet') {
        const p = clamp(t / TO_SHEET)
        at = between({ x: TENT_TAP.x, y: SHEET_GRAB.y }, SHEET_GRAB, ease(p))
        hand = clamp(t / (TO_SHEET * 0.6))
        if (p === 1) enter('scroll', now)
      } else if (phase === 'scroll') {
        // One drag, doing what a drag on a part-shown sheet does: it lifts the
        // sheet first, and only once the sheet is up does the panel move. The
        // finger travels the sum of the two, so nothing slips under it.
        const lift = SHEET_REST - SHEET_FULL
        const p = ease(clamp(t / SCROLL))
        const travelled = (lift + SCROLL_END) * p
        sheet = SHEET_REST - Math.min(lift, travelled)
        scroll = Math.max(0, travelled - lift)
        at = { x: SHEET_GRAB.x, y: SHEET_GRAB.y - travelled }
        if (t >= SCROLL) enter('rest', now)
      } else if (phase === 'rest') {
        if (t >= REST) enter('tapTool', now)
      } else if (phase === 'tapTool') {
        const p = clamp(t / TAP_TOOL)
        at = TOOL_TAP
        tap = 1 - 0.11 * Math.sin(Math.PI * p)
        press = 1 - 0.04 * Math.sin(Math.PI * p)
        if (p === 1) enter('toolIn', now)
      } else if (phase === 'toolIn') {
        const p = ease(clamp(t / TOOL_IN))
        tap = 1
        press = 1
        tool = p
        hand = 1 - clamp(t / (TOOL_IN * 0.5))
        if (t >= TOOL_IN) enter('turnOut', now)
      } else if (phase === 'turnOut') {
        // the tool's own map, turned a little to show it is live
        spin = SPIN * (1 - 2 * ease(clamp(t / TURN)))
        if (t >= TURN) enter('turnBack', now)
      } else if (phase === 'turnBack') {
        spin = SPIN * (2 * ease(clamp(t / TURN)) - 1)
        if (t >= TURN) enter('done', now)
      } else {
        // a beat on the open tool, then a straight cut back to the map
        if (t >= DONE) {
          pan = { x: 0, y: 0 }
          sheet = SHEET_GONE
          scroll = 0
          tool = 0
          spin = SPIN
          hand = 0
          at = OFF
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
    <figure className="ranging-demo">
      <div className="ranging-stage aap-stage" ref={stageRef}>
        <div className="aap-home">
          <Image
            className="aap-map"
            src="/projects/alpha-ranging-map.jpg"
            alt=""
            width={750}
            height={1630}
            sizes="(max-width: 768px) 70vw, 320px"
          />

          {PINS.map((p) => (
            <Image
              key={p.key}
              className="aap-pin"
              src={p.src}
              alt=""
              width={43}
              height={52}
              style={pinAt(p.x, p.y)}
            />
          ))}

          {/* Real glass, so the map keeps moving behind it. */}
          <span className="aap-glass aap-glass--search" />
          <span className="aap-glass aap-glass--weather" />
          <span className="aap-glass aap-glass--device" />
          <span className="aap-glass aap-glass--locate" />
          <span className="aap-glass aap-glass--td" />
          <span className="aap-glass aap-tabbar" />
          <span className="aap-island" />
          <Image
            className="aap-avatar"
            src="/projects/alpha-aap-avatar.png"
            alt=""
            width={41}
            height={40}
          />
          {/* The line work that sits on the glass, and the status bar's type. */}
          <Image
            className="aap-glyphs"
            src="/projects/alpha-aap-glyphs.png"
            alt=""
            width={375}
            height={815}
            sizes="(max-width: 768px) 70vw, 320px"
          />

          {/* The waypoint's own sheet. Its top group is pinned to the sheet and
              the panel runs up behind it. */}
          <div className="aap-sheet">
            <Image
              className="aap-panel"
              src="/projects/alpha-aap-panel.png"
              alt=""
              width={375}
              height={964}
              sizes="(max-width: 768px) 70vw, 320px"
            />
            <Image
              className="aap-top"
              src="/projects/alpha-aap-top.png"
              alt=""
              width={375}
              height={88}
              sizes="(max-width: 768px) 70vw, 320px"
            />
          </div>
        </div>

        {/* The range tool, opened from the waypoint rather than from the walker
            — so the line runs down to the waypoint's own pin. */}
        <div className="aap-tool">
          <Image
            className="aap-toolmap"
            src="/projects/alpha-ranging-map.jpg"
            alt=""
            width={750}
            height={1630}
            sizes="(max-width: 768px) 70vw, 320px"
          />
          <span className="ranging-plumb" />
          {RUNGS.map((y) => (
            <div className="ranging-rung" key={y} style={rowAt(y)}>
              <span className="ranging-rung-hair" />
              <span className="ranging-rung-bar ranging-rung-bar--l" />
              <span className="ranging-rung-bar ranging-rung-bar--r" />
            </div>
          ))}
          <Image className="ranging-line" src="/projects/alpha-ranging-line.png" alt="" width={4} height={284} />
          <Image
            className="ranging-handles"
            src="/projects/alpha-ranging-handles.png"
            alt=""
            width={206}
            height={23}
          />
          <Image className="aap-anchor" src="/projects/alpha-aap-tent.png" alt="" width={43} height={52} />
          <Image
            className="ranging-chrome"
            src="/projects/alpha-ranging-chrome.png"
            alt=""
            width={375}
            height={815}
            sizes="(max-width: 768px) 70vw, 320px"
          />
          <div className="ranging-readout">
            <span>26 yd</span>
          </div>
          {RUNGS.map((y, i) => (
            <div className="ranging-tag" key={y} style={rowAt(y)}>
              {RUNG_YARDS[i]} yd
            </div>
          ))}
          <Image className="ranging-button" src="/projects/alpha-ranging-mark.png" alt="" width={96} height={47} />
        </div>

        <Image
          className="ranging-hand"
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
