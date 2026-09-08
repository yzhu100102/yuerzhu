// A clip that loops where a picture would otherwise sit.
//
// Two reasons this is a client component rather than a plain <video autoplay>:
// it stops for a reader who has asked for no motion, holding its first frame,
// and it only runs while it is actually on screen, so a page carrying several
// of them is not decoding all of them at once.
'use client'

import { useEffect, useRef } from 'react'

type Props = {
  src: string
  /** What the clip shows, for anything not watching it. */
  label: string
  className?: string
}

export default function LoopClip({ src, label, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      video.currentTime = 0
      return
    }

    const eye = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.2 },
    )
    eye.observe(video)
    return () => eye.disconnect()
  }, [])

  return (
    <video
      className={className}
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
