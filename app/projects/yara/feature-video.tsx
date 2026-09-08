'use client'

// A looping feature clip. Given more than one source it plays them back to back
// and loops the set, which is how two separate exports become one continuous
// loop without re-encoding them into a single file.
//
// Every clip is mounted at once, with only the active one visible. Swapping
// `src` on a single element instead would blank the frame while the next file
// loaded, which reads as a stutter at each handover.
//
// What is mounted is not what is running, though. A clip plays only while its
// block is on screen, and nothing is buffered in full until the reader has
// reached it — this page carries six of these, and a phone asked to hold six
// buffered streams and decode them all at once, for the whole length of the
// article, is a phone that hands the tab back reclaimed.

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Played in order, then looped. */
  sources: string[]
  label: string
}

export default function FeatureVideo({ sources, label }: Props) {
  const [active, setActive] = useState(0)
  /** Whether the block is on screen: what decides if anything is running. */
  const [showing, setShowing] = useState(false)
  /**
   * Whether it ever has been. Buffering is held back until then, and not given
   * up afterwards — a reader scrolling back to a clip should find it ready
   * rather than watch it load again.
   */
  const [reached, setReached] = useState(false)
  const holder = useRef<HTMLDivElement>(null)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const single = sources.length === 1

  useEffect(() => {
    const el = holder.current
    if (!el) return
    const eye = new IntersectionObserver(
      ([entry]) => {
        setShowing(entry.isIntersecting)
        if (entry.isIntersecting) setReached(true)
      },
      { threshold: 0.2 },
    )
    eye.observe(el)
    return () => eye.disconnect()
  }, [])

  // A clip taking over starts from its own first frame, whether or not the
  // handover happened while anyone was watching.
  useEffect(() => {
    const video = videos.current[active]
    if (video) video.currentTime = 0
  }, [active])

  // The one clip that should be running, running — and every other one, and all
  // of them when the block is away or the reader has asked for no motion,
  // stopped.
  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    videos.current.forEach((video, i) => {
      if (!video) return
      if (i !== active || !showing || still) {
        video.pause()
        return
      }
      // autoplay can still be refused; nothing useful to do if it is
      video.play().catch(() => {})
    })
  }, [active, showing])

  return (
    <div className="feature-video" ref={holder}>
      {sources.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            videos.current[i] = el
          }}
          src={src}
          aria-label={i === 0 ? label : undefined}
          aria-hidden={i === 0 ? undefined : true}
          loop={single}
          muted
          playsInline
          preload={reached ? 'auto' : 'metadata'}
          onEnded={
            single
              ? undefined
              : () => setActive((current) => (current + 1) % sources.length)
          }
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
