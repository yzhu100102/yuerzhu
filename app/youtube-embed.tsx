'use client'

// A YouTube embed that holds off loading until it is properly in view, then
// starts itself. Browsers only grant autoplay to muted video, so it starts
// muted with YouTube's full control bar — play, pause, volume, captions,
// quality, fullscreen — so the viewer can turn the sound on whenever they want.
//
// The moment they touch the player, the scroll observer stops issuing commands.
// Otherwise scrolling a little would pause a video someone had deliberately
// started, which is worse than never having autoplayed it at all.

import { useCallback, useEffect, useRef, useState } from 'react'

/** Share of the player that must be on screen before it plays. */
const IN_VIEW = 0.9

type Props = {
  /** The `v=` value from the watch URL. */
  id: string
  /** Used as the iframe's accessible name. */
  title: string
}

export default function YoutubeEmbed({ id, title }: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  /** Set once the viewer takes manual control; we stop steering after that. */
  const viewerDriving = useRef(false)

  const command = useCallback((func: 'playVideo' | 'pauseVideo') => {
    if (viewerDriving.current) return
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      'https://www.youtube.com'
    )
  }, [])

  // Clicking into an iframe moves focus out of the page, which is the one
  // signal we get that someone is using the player's own controls.
  useEffect(() => {
    const onBlur = () => {
      if (document.activeElement === iframeRef.current) {
        viewerDriving.current = true
      }
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // A player taller than the window can never be 90% visible, so also
        // count it as in view once it fills most of the screen.
        const fillsScreen =
          entry.intersectionRect.height >= window.innerHeight * 0.85
        const inView = entry.intersectionRatio >= IN_VIEW || fillsScreen

        if (viewerDriving.current) return

        if (inView) {
          // The first pass mounts the iframe with autoplay, which is what
          // actually starts it. Later passes talk to the player directly.
          setLoaded((already) => {
            if (already) command('playVideo')
            return true
          })
        } else {
          command('pauseVideo')
        }
      },
      { threshold: [0, 0.25, 0.5, IN_VIEW, 1] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [command])

  const src =
    `https://www.youtube.com/embed/${encodeURIComponent(id)}` +
    // controls=1 and fs=1 are YouTube's defaults, set explicitly so a later
    // edit does not quietly take the control bar away
    '?autoplay=1&mute=1&controls=1&fs=1&enablejsapi=1&playsinline=1&rel=0'

  return (
    <div className="case-video" ref={frameRef}>
      {loaded ? (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      ) : (
        // holds the 16:9 box so nothing shifts when the player mounts
        <div className="case-video-idle" aria-hidden="true" />
      )}
    </div>
  )
}
