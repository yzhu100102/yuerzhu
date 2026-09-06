// Compass Lock, running.
//
// One phone screen, played as a sequence: a hand comes in, taps the lock, the
// button turns white, and only then does the hand drop to the compass tape and
// drag it — out one way and back the other, with the map turning underneath it
// for exactly as far as the hand goes. The map is held still until the lock is
// engaged, which is the point of the feature: the map does not move until you
// say so.
//
// The map is a still, turned here rather than a clip played back, so the turn
// is tied to the hand rather than to a playhead: the tape reads 1.5 pixels to
// the degree, so a finger that drags it 48 pixels has turned the walker 32
// degrees, and the map is rotated by exactly that under them. Dragging home
// unwinds it, because it is the same sum run backwards.
//
// The screen's own furniture — the sight line, the graduations, the range
// slider with its two handles, the walker's arrow — is the same set the Range
// panel uses, so the two read as one app. It borrows those classes by name.
'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

import CompassTape, { PER_DEG } from './compass-tape'

// The sight line, and the walker standing on it: the point the map turns about,
// because turning on the spot is what this feature is for.
const AXIS = 187.5

// Half the sweep, and the zoom that lets the map turn that far about the walker
// without pulling a corner into frame. The map starts pushed up rather than
// centred, which is what keeps the zoom this low.
const HALF = 16
const REST_HEADING = 45

// The graduations, which do not change here.
const RUNGS = [137, 284, 431, 579]
const RUNG_FEET = [68, 58, 48, 38]

// Seconds, in the order they happen.
const APPROACH = 0.9
const TAP = 0.5
const SETTLE = 0.3
const REACH = 0.7
const DRAG = 2.6
const TURN = 0.35
const REST = 0.5

type Point = { x: number; y: number }

// Where the fingertip goes. The drag runs 48 pixels because that is what 32
// degrees of tape is; the hand and the tape move together or not at all.
const OFF = { x: 435, y: 245 }
const LOCK = { x: 341.5, y: 83.5 }
const TAPE_IN = { x: AXIS + HALF * PER_DEG, y: 756 }
const TAPE_OUT = { x: AXIS - HALF * PER_DEG, y: 756 }

// The hand is drawn 112.5 wide and points from 70, 34 of its own 142 square.
const FINGER = { x: 0.79, y: 29.31 }

const clamp = (n: number) => Math.max(0, Math.min(1, n))
// slow at both ends, so the hand arrives rather than stops
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const between = (a: Point, b: Point, p: number) => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
})
const at = (v: number) => ({ '--y': v }) as CSSProperties

type Phase = 'approach' | 'tap' | 'settle' | 'reach' | 'drag' | 'turn' | 'back' | 'rest'

export default function RangeDemo() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    // travel: 0 with the tape at one end of its drag, 1 at the other.
    let travel = 0
    let locked = 0
    let press = 1
    let hand = 0
    let arrows = 0
    let hint: Point = OFF

    const write = () => {
      // One number, three ways: how far the walker has turned tells the tape
      // where to sit and the map how far to come back from its own start.
      const heading = REST_HEADING + (travel * 2 - 1) * HALF
      const set = (name: string, value: number, places = 3) =>
        stage.style.setProperty(`--${name}`, value.toFixed(places))
      set('spin', REST_HEADING - heading, 2)
      set('tape', AXIS - heading * PER_DEG, 2)
      set('locked', locked)
      set('press', press)
      set('hand', hand)
      set('arrows', arrows)
      set('hx', hint.x + FINGER.x, 2)
      set('hy', hint.y + FINGER.y, 2)
    }

    // Nothing moves for a reader who has asked for that. The panel keeps the
    // still the stylesheet already describes: unlocked, tape at rest.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      travel = 0.5
      write()
      return
    }

    let frame = 0
    let phase: Phase = 'approach'
    let since = performance.now()
    const enter = (next: Phase, now: number) => {
      phase = next
      since = now
    }

    const step = (now: number) => {
      const t = (now - since) / 1000

      if (phase === 'approach') {
        const p = clamp(t / APPROACH)
        hint = between(OFF, LOCK, ease(p))
        hand = clamp(t / 0.3)
        if (p === 1) enter('tap', now)
      } else if (phase === 'tap') {
        const p = clamp(t / TAP)
        hint = LOCK
        // down, then back up; the button turns at the bottom of the press
        press = 1 - 0.12 * Math.sin(Math.PI * p)
        locked = clamp((p - 0.35) / 0.15)
        if (p === 1) enter('settle', now)
      } else if (phase === 'settle') {
        hint = LOCK
        press = 1
        locked = 1
        if (t >= SETTLE) enter('reach', now)
      } else if (phase === 'reach') {
        const p = clamp(t / REACH)
        hint = between(LOCK, TAPE_IN, ease(p))
        // the arrows arrive with the hand, as what it is about to do
        arrows = p
        if (p === 1) enter('drag', now)
      } else if (phase === 'drag') {
        // out: the tape runs under the finger and the map turns with it
        travel = ease(clamp(t / DRAG))
        hint = { x: TAPE_IN.x + (TAPE_OUT.x - TAPE_IN.x) * travel, y: TAPE_IN.y }
        if (t >= DRAG) enter('turn', now)
      } else if (phase === 'turn') {
        // the beat at the far end, before the hand changes its mind
        travel = 1
        hint = TAPE_OUT
        if (t >= TURN) enter('back', now)
      } else if (phase === 'back') {
        // home: the same drag the other way, so the map unwinds
        travel = 1 - ease(clamp(t / DRAG))
        hint = { x: TAPE_IN.x + (TAPE_OUT.x - TAPE_IN.x) * travel, y: TAPE_IN.y }
        if (t >= DRAG) enter('rest', now)
      } else {
        const p = clamp(t / REST)
        travel = 0
        hint = TAPE_IN
        hand = 1 - p
        // back to the top: unlocked, tape at rest, hand off screen
        if (p === 1) {
          locked = 0
          arrows = 0
          hand = 0
          hint = OFF
          enter('approach', now)
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
      <div className="ranging-stage lock-stage" ref={stageRef}>
        <Image
          className="lock-map"
          src="/projects/alpha-nav-map.jpg"
          alt=""
          width={750}
          height={1630}
          sizes="(max-width: 768px) 70vw, 320px"
        />

        {/* The sight line and its graduations. */}
        <span className="ranging-plumb" />
        {RUNGS.map((y) => (
          <div className="ranging-rung" key={y} style={at(y)}>
            <span className="ranging-rung-hair" />
            <span className="ranging-rung-bar ranging-rung-bar--l" />
            <span className="ranging-rung-bar ranging-rung-bar--r" />
          </div>
        ))}

        {/* The range slider, at rest: the line up from the walker and the two
            handles that set it, which is how it reads on every other screen. */}
        <Image className="ranging-line" src="/projects/alpha-ranging-line.png" alt="" width={4} height={284} />
        <Image
          className="ranging-handles"
          src="/projects/alpha-ranging-handles.png"
          alt=""
          width={206}
          height={23}
        />
        <Image className="ranging-user" src="/projects/alpha-ranging-user.png" alt="" width={54} height={64} />

        <Image
          className="ranging-chrome"
          src="/projects/alpha-nav-chrome.png"
          alt=""
          width={375}
          height={815}
          sizes="(max-width: 768px) 70vw, 320px"
        />

        {RUNGS.map((y, i) => (
          <div className="ranging-tag" key={y} style={at(y)}>
            {RUNG_FEET[i]} ft
          </div>
        ))}

        {/* Locked: the button's own white face and closed padlock, laid over the
            open one the chrome carries. */}
        <Image
          className="lock-shut"
          src="/projects/alpha-lock-shut.png"
          alt=""
          width={44}
          height={44}
        />

        <CompassTape />

        {/* The hand, and the arrows it earns once it is on the tape. Two files
            cut from one drawing, so they line up exactly when both are up. */}
        <Image
          className="ranging-hand"
          src="/projects/alpha-tap-hint.png"
          alt=""
          width={142}
          height={142}
          sizes="(max-width: 768px) 24vw, 110px"
        />
        <Image
          className="ranging-hand lock-arrows"
          src="/projects/alpha-drag-arrows.png"
          alt=""
          width={142}
          height={142}
          sizes="(max-width: 768px) 24vw, 110px"
        />
      </div>
    </figure>
  )
}
