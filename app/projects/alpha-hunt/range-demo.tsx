// Compass Lock, running.
//
// One phone screen, played as a sequence: a hand comes in, taps the lock, the
// button turns white, and only then does the hand drop to the compass tape and
// drag it — with the map turning underneath for exactly as long as the drag
// lasts. The map is held on its first frame until the lock is engaged, which
// is the point of the feature: the map does not move until you say so.
//
// Everything the CSS needs is written onto the stage as custom properties, one
// set per frame. The drag is read off the video's own playhead rather than a
// clock of its own, so the tape and the map can never drift apart.
'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

// The clip's own length, for the frames before its metadata arrives and for a
// browser that refuses to autoplay it.
const CLIP_SECONDS = 3.5633

// Seconds, in the order they happen. The drag takes as long as the clip does.
const APPROACH = 0.9
const TAP = 0.5
const SETTLE = 0.3
const REACH = 0.7
const REST = 0.5

// Where the hand's own centre sits, as a percentage of the screen.
//
// The lock stop is set from the artwork: the button's centre is at 341.5, 82.5
// of the 375 x 815 screen, and the fingertip is at 70, 34 of the hint's 142
// square — which, drawn at 30% of the screen, puts the fingertip 29.3 above
// the hint's centre and 0.9 to its left. Hence the offset stop below.
const OFF_SCREEN = { x: 116, y: 30 }
const LOCK = { x: 91.3, y: 13.7 }
const TAPE_IN = { x: 72, y: 92.8 }
const TAPE_OUT = { x: 24, y: 92.8 }

type Point = { x: number; y: number }

const clamp = (n: number) => Math.max(0, Math.min(1, n))
// slow at both ends, so the hand arrives rather than stops
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const between = (a: Point, b: Point, p: number) => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
})

type Phase = 'approach' | 'tap' | 'settle' | 'reach' | 'drag' | 'rest'

export default function RangeDemo() {
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const video = videoRef.current
    if (!stage || !video) return

    // Nothing moves for a reader who has asked for that. The panel keeps the
    // still the stylesheet already describes: unlocked, tape on north.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      return
    }

    let frame = 0
    let phase: Phase = 'approach'
    let since = performance.now()
    // set when the browser refuses to autoplay, so the drag falls back to a
    // clock and the sequence still reads
    let blocked = false

    const set = (values: Record<string, number>) => {
      for (const [name, value] of Object.entries(values)) {
        stage.style.setProperty(`--${name}`, value.toFixed(3))
      }
    }
    const place = (at: Point) => {
      stage.style.setProperty('--hx', `${at.x.toFixed(2)}%`)
      stage.style.setProperty('--hy', `${at.y.toFixed(2)}%`)
    }
    const enter = (next: Phase, now: number) => {
      phase = next
      since = now
    }

    video.pause()
    video.currentTime = 0

    const draw = (now: number) => {
      const clip = video.duration || CLIP_SECONDS
      const elapsed = (now - since) / 1000

      if (phase === 'approach') {
        const p = clamp(elapsed / APPROACH)
        place(between(OFF_SCREEN, LOCK, ease(p)))
        set({ hint: clamp(elapsed / 0.3), arrows: 0, press: 1, locked: 0, travel: 0 })
        if (p === 1) enter('tap', now)
      } else if (phase === 'tap') {
        const p = clamp(elapsed / TAP)
        place(LOCK)
        // down, then back up; the button turns at the bottom of the press
        set({
          hint: 1,
          arrows: 0,
          press: 1 - 0.12 * Math.sin(Math.PI * p),
          locked: clamp((p - 0.35) / 0.15),
          travel: 0,
        })
        if (p === 1) enter('settle', now)
      } else if (phase === 'settle') {
        place(LOCK)
        set({ hint: 1, arrows: 0, press: 1, locked: 1, travel: 0 })
        if (elapsed >= SETTLE) enter('reach', now)
      } else if (phase === 'reach') {
        const p = clamp(elapsed / REACH)
        place(between(LOCK, TAPE_IN, ease(p)))
        // the arrows arrive with the hand, as what it is about to do
        set({ hint: 1, arrows: p, press: 1, locked: 1, travel: 0 })
        if (p === 1) {
          enter('drag', now)
          video.play().catch(() => {
            blocked = true
          })
        }
      } else if (phase === 'drag') {
        // a play() that quietly never started would otherwise hold the
        // sequence here for good; half a second of a paused video is enough
        // to know it is not coming
        if (!blocked && video.paused && elapsed > 0.5) blocked = true
        const travel = blocked
          ? clamp(elapsed / clip)
          : clamp(video.currentTime / clip)
        place(between(TAPE_IN, TAPE_OUT, travel))
        set({ hint: 1, arrows: 1, press: 1, locked: 1, travel })
        if (travel >= 0.999 || video.ended) {
          video.pause()
          enter('rest', now)
        }
      } else {
        const p = clamp(elapsed / REST)
        place(TAPE_OUT)
        set({ hint: 1 - p, arrows: 1, press: 1, locked: 1, travel: 1 })
        if (p === 1) {
          // back to the top: unlocked, map on its first frame, hand off screen
          video.currentTime = 0
          enter('approach', now)
        }
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <figure className="range-demo">
      <div className="range-stage" ref={stageRef}>
        <video
          className="range-map"
          ref={videoRef}
          src="/projects/alpha-map-rotate.mp4"
          poster="/projects/alpha-map-rotate-poster.jpg"
          aria-label="The compass tape being dragged once the compass is locked, turning the map underneath it."
          muted
          playsInline
          preload="auto"
        />

        {/* The locked button's white face, under the UI so the artwork's own
            closed padlock sits on top of it once it appears. */}
        <span className="range-lock-face" />

        {/* The ranging UI, transparent everywhere the map shows through. */}
        <Image
          className="range-ui"
          src="/projects/alpha-range-tool.png"
          alt=""
          width={375}
          height={815}
          sizes="(max-width: 768px) 70vw, 320px"
        />

        {/* The unlocked button, over the UI so it covers the closed padlock
            underneath until the tap takes it away. */}
        <Image
          className="range-lock-open"
          src="/projects/alpha-lock-open.png"
          alt=""
          width={45}
          height={44}
        />

        {/* The tape is wider than the screen and slides behind its own window,
            so the bearing under the middle of the screen changes as it goes. */}
        <div className="range-tape-window">
          <Image
            className="range-tape"
            src="/projects/alpha-compass-tape.png"
            alt=""
            width={564}
            height={117}
            sizes="(max-width: 768px) 106vw, 482px"
          />
        </div>

        {/* The hand, and the arrows it earns once it is on the tape. Two files
            cut from one drawing, so they line up exactly when both are up. */}
        <Image
          className="range-hint"
          src="/projects/alpha-tap-hint.png"
          alt=""
          width={142}
          height={142}
          sizes="(max-width: 768px) 24vw, 110px"
        />
        <Image
          className="range-hint range-hint--arrows"
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
