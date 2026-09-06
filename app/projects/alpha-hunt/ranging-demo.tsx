// Range, running.
//
// The four Range mocks are one gesture told in four stops: the map at rest, the
// map opened up on the lake, the slider pulled to the near shore, and the
// waypoint dropped on the water. This plays the gesture between them — a pinch
// opens the map on the lake, a hand drags the slider up to the water's edge,
// then crosses to Mark and drops the pin. The loop cuts from the finished
// screen straight back to the first one, the way a demo reel would.
//
// The mocks are 375 x 815, so the stylesheet works in those pixels: --u is one
// of them, and every offset below is read straight off the artwork. The script
// writes one set of custom properties onto the stage each frame and the numbers
// as text, because the numbers are the point — the graduations count from yards
// to feet as the map opens, and the readout counts with them.
'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

// The zoom, solved off the mocks: screen 2 is screen 1 scaled by this much
// about a point just above the top edge, a little right of centre.
const OPEN = 1.3546

// The slider's top edge, in artwork pixels, down at rest and up at the shore.
const BAR_DOWN = 500
const BAR_UP = 222

// Each graduation: where its rung sits, what it reads zoomed out, and what it
// reads zoomed in. Ten yards a division becomes ten feet a division.
const ROWS = [
  { y: 137, near: 43, far: 68 },
  { y: 284, near: 33, far: 58 },
  { y: 431, near: 23, far: 48 },
  { y: 579, near: 13, far: 38 },
]

// The range itself: 26 yards at rest, 42 feet once the map opens, 63 feet once
// the slider is on the shore.
const AT_REST = 26
const OPENED = 42
const SLID = 63

// Seconds, in the order they happen.
const SETTLE = 0.45
const ARRIVE = 0.4
const PINCH = 1.3
const LINGER = 0.3
const TO_BAR = 0.7
const SLIDE = 1.3
const TO_MARK = 0.65
const MARK = 0.34
const HOLD = 1.3

type Point = { x: number; y: number }

// Where the fingertip goes. The lake is where it sits before the map opens;
// the grip is the slider's right handle; Mark is the button.
const OFF = { x: 300, y: 900 }
const LAKE = { x: 184, y: 150 }
const GRIP_X = 260
const BUTTON = { x: 316, y: 649 }

// The hand is drawn 112.5 wide and its fingertip is at 70, 34 of the artwork's
// 142 square — so the drawing's centre sits this far from where it points.
const FINGER = { x: 0.79, y: 29.31 }

const clamp = (n: number) => Math.max(0, Math.min(1, n))
// slow at both ends, so the hand arrives rather than stops
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const between = (a: Point, b: Point, p: number) => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
})
const row = (y: number) => ({ '--y': y }) as CSSProperties

type Phase =
  | 'settle' | 'arrive' | 'pinch' | 'linger'
  | 'toBar' | 'slide' | 'toMark' | 'mark' | 'hold'

export default function RangingDemo() {
  const stageRef = useRef<HTMLDivElement>(null)
  const readRef = useRef<HTMLSpanElement>(null)
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    // How far through each of the two moves that change the numbers, how much
    // of the waypoint is down, and where the hand is.
    let open = 0
    let slid = 0
    let pin = 0
    let press = 1
    let tap = 1
    let hand = 0
    let pinch = 0
    let spread = 0
    let at: Point = OFF
    const said: string[] = []

    const write = () => {
      const bar = BAR_DOWN + (BAR_UP - BAR_DOWN) * slid
      const set = (name: string, value: number, places = 3) =>
        stage.style.setProperty(`--${name}`, value.toFixed(places))
      set('zoom', 1 + (OPEN - 1) * open, 4)
      set('bar', bar, 2)
      set('pin', pin)
      set('press', press)
      set('tap', tap)
      set('hand', hand)
      set('pinch', pinch)
      set('spread', spread)
      set('hx', at.x + FINGER.x, 2)
      set('hy', at.y + FINGER.y, 2)

      // Yards until the map is half open, feet after it. The readout runs 26 to
      // 42 on the zoom and 42 to 63 on the slide, and the slide only moves once
      // the zoom is done, so one sum covers both.
      const unit = open < 0.5 ? 'yd' : 'ft'
      const range = AT_REST + (OPENED - AT_REST) * open + (SLID - OPENED) * slid
      const labels = ROWS.map((r) => `${Math.round(r.near + (r.far - r.near) * open)} ${unit}`)
      labels.push(`${Math.round(range)} ${unit}`)
      const nodes = [...tagRefs.current, readRef.current]
      labels.forEach((text, i) => {
        if (said[i] === text) return
        said[i] = text
        const node = nodes[i]
        if (node) node.textContent = text
      })
    }

    // Nothing moves for a reader who has asked for that. They get the last of
    // the four screens: opened, slid, and marked.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      open = 1; slid = 1; pin = 1
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
        if (t >= SETTLE) enter('arrive', now)
      } else if (phase === 'arrive') {
        // the pinch is one drawing, so it arrives by fading up over the water
        // rather than travelling in
        at = LAKE
        pinch = clamp(t / 0.3)
        if (t >= ARRIVE) enter('pinch', now)
      } else if (phase === 'pinch') {
        // the fingers open and the map opens with them, and the graduations
        // turn from yards to feet on the way
        const p = ease(clamp(t / PINCH))
        at = LAKE
        pinch = 1
        spread = p
        open = p
        if (t >= PINCH) enter('linger', now)
      } else if (phase === 'linger') {
        at = LAKE
        pinch = 1; spread = 1; open = 1
        if (t >= LINGER) enter('toBar', now)
      } else if (phase === 'toBar') {
        // the pinch lets go and the pointing hand takes over on the way down
        const p = clamp(t / TO_BAR)
        pinch = 1 - clamp(t / (TO_BAR * 0.3))
        hand = clamp((t - TO_BAR * 0.35) / (TO_BAR * 0.4))
        at = between(LAKE, { x: GRIP_X, y: BAR_DOWN + 11.5 }, ease(p))
        if (p === 1) enter('slide', now)
      } else if (phase === 'slide') {
        // the hand keeps hold of the slider, so it is read off the same number
        slid = ease(clamp(t / SLIDE))
        at = { x: GRIP_X, y: BAR_DOWN + (BAR_UP - BAR_DOWN) * slid + 11.5 }
        if (t >= SLIDE) enter('toMark', now)
      } else if (phase === 'toMark') {
        const p = clamp(t / TO_MARK)
        at = between({ x: GRIP_X, y: BAR_UP + 11.5 }, BUTTON, ease(p))
        if (p === 1) enter('mark', now)
      } else if (phase === 'mark') {
        const p = clamp(t / MARK)
        at = BUTTON
        tap = 1 - 0.11 * Math.sin(Math.PI * p)
        press = 1 - 0.06 * Math.sin(Math.PI * p)
        // the pin lands as the button bottoms out
        pin = clamp((p - 0.45) / 0.35)
        if (p === 1) enter('hold', now)
      } else {
        tap = 1; press = 1; pin = 1
        // a beat on the finished screen, then a straight cut back to the first
        // one — nothing is wound back, the loop just starts again
        if (t >= HOLD) {
          open = 0; slid = 0; pin = 0; hand = 0; pinch = 0; spread = 0
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
      <div className="ranging-stage" ref={stageRef}>
        <Image
          className="ranging-map"
          src="/projects/alpha-ranging-map.jpg"
          alt=""
          width={375}
          height={815}
          sizes="(max-width: 768px) 70vw, 320px"
        />

        {/* The sight line, and the graduations across it. */}
        <span className="ranging-plumb" />
        {ROWS.map((r) => (
          <div className="ranging-rung" key={r.y} style={row(r.y)}>
            <span className="ranging-rung-hair" />
            <span className="ranging-rung-bar ranging-rung-bar--l" />
            <span className="ranging-rung-bar ranging-rung-bar--r" />
          </div>
        ))}

        {/* Everything that never moves — status bar, the three buttons, the
            compass tape — lifted off the mocks in one piece. */}
        <Image
          className="ranging-chrome"
          src="/projects/alpha-ranging-chrome.png"
          alt=""
          width={375}
          height={815}
          sizes="(max-width: 768px) 70vw, 320px"
        />

        {/* The range: a line from the user up to the slider, the slider itself,
            the waypoint it leaves behind, and the user's own arrow over the
            foot of the line. */}
        <Image className="ranging-line" src="/projects/alpha-ranging-line.png" alt="" width={4} height={284} />
        <Image className="ranging-handles" src="/projects/alpha-ranging-handles.png" alt="" width={206} height={23} />
        <Image className="ranging-waypoint" src="/projects/alpha-ranging-waypoint.png" alt="" width={37} height={50} />
        <Image className="ranging-user" src="/projects/alpha-ranging-user.png" alt="" width={54} height={64} />

        {/* The numbers, which are the thing being demonstrated. */}
        <div className="ranging-readout">
          <span ref={readRef}>{AT_REST} yd</span>
        </div>
        {ROWS.map((r, i) => (
          <div className="ranging-tag" key={r.y} style={row(r.y)}>
            <span
              ref={(el) => {
                tagRefs.current[i] = el
              }}
            >
              {r.near} yd
            </span>
          </div>
        ))}

        <Image className="ranging-button" src="/projects/alpha-ranging-mark.png" alt="" width={96} height={47} />

        {/* Two drawings, one gesture each: the pinch that opens the map, and
            the hand that drags the slider and presses Mark. */}
        <Image
          className="ranging-pinch"
          src="/projects/alpha-ranging-pinch.png"
          alt=""
          width={240}
          height={240}
          sizes="(max-width: 768px) 28vw, 130px"
        />
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
