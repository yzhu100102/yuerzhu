// A recording sitting in a watch's glass.
//
// The only reason this is a client component: every other moving thing on this
// page stops for a reader who has asked for that, and a plain autoplaying video
// would not. It holds its first frame instead.
'use client'

import { useEffect, useRef } from 'react'

export default function WatchClip({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      video.currentTime = 0
    }
  }, [])

  return (
    <video
      className="case-ref-screen"
      ref={ref}
      src={src}
      aria-label={label}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    />
  )
}
