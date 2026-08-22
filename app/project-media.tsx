'use client'

// The tinted video card. The clip runs only as far as "Hi! I'm Yara," and then
// cuts to a title card: the orange dot arrives in the middle of the frame on its
// own, the project name types itself in beside it, and the loop starts over.

import { useEffect, useRef, useState } from 'react'

/** Where the clip is cut — just after "Hi! I'm Yara," has settled. */
const CUT_AT = 3.4
/** The dot holds the centre alone before the name appears beside it. */
const DOT_ALONE = 0.5
const TYPE_FOR = 0.7
const HOLD_AFTER = 1.6

type Props = {
  src: string
  poster?: string
  label: string
  /** Typed in beside the dot once the clip has been cut. */
  endTitle?: string
}

export default function ProjectMedia({ src, poster, label, endTitle }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  // characters revealed; -1 while the clip is playing
  const [typed, setTyped] = useState(-1)
  // bumped each time the card comes round, so the dot replays its entrance
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !endTitle) return

    let frame = 0
    let last = -1
    let cardStart = 0
    let onCard = false

    const show = (next: number) => {
      if (next !== last) {
        last = next
        setTyped(next)
      }
    }

    const tick = () => {
      if (!onCard) {
        if (video.currentTime >= CUT_AT) {
          onCard = true
          cardStart = performance.now()
          video.pause()
          setCycle((n) => n + 1)
          show(0)
        }
      } else {
        const t = (performance.now() - cardStart) / 1000
        if (t < DOT_ALONE) {
          show(0)
        } else if (t < DOT_ALONE + TYPE_FOR) {
          const ratio = (t - DOT_ALONE) / TYPE_FOR
          show(Math.round(ratio * endTitle.length))
        } else if (t < DOT_ALONE + TYPE_FOR + HOLD_AFTER) {
          show(endTitle.length)
        } else {
          onCard = false
          show(-1)
          video.currentTime = 0
          video.play().catch(() => {})
        }
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [endTitle])

  const showingCard = typed >= 0

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={label}
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{ opacity: showingCard ? 0 : 1 }}
      />

      {endTitle && (
        <div className="endcard" style={{ opacity: showingCard ? 1 : 0 }}>
          <p className="endcard-text">
            <span>{endTitle.slice(0, Math.max(0, typed))}</span>
            {/* keyed on the cycle so the dot animates in on every loop */}
            <span className="endcard-caret" key={cycle} />
          </p>
        </div>
      )}
    </>
  )
}
