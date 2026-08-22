'use client'

// A looping feature clip. Given more than one source it plays them back to back
// and loops the set, which is how two separate exports become one continuous
// loop without re-encoding them into a single file.
//
// Every clip is mounted at once and preloaded, with only the active one visible.
// Swapping `src` on a single element instead would blank the frame while the
// next file loaded, which reads as a stutter at each handover.

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Played in order, then looped. */
  sources: string[]
  label: string
}

export default function FeatureVideo({ sources, label }: Props) {
  const [active, setActive] = useState(0)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const single = sources.length === 1

  useEffect(() => {
    const video = videos.current[active]
    if (!video) return
    video.currentTime = 0
    // autoplay can still be refused; nothing useful to do if it is
    video.play().catch(() => {})
  }, [active])

  return (
    <div className="feature-video">
      {sources.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            videos.current[i] = el
          }}
          src={src}
          aria-label={i === 0 ? label : undefined}
          aria-hidden={i === 0 ? undefined : true}
          autoPlay={i === 0}
          loop={single}
          muted
          playsInline
          preload="auto"
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
