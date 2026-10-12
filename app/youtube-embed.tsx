'use client'

// A YouTube embed that mounts as soon as the page does and starts itself.
// Browsers only grant autoplay to muted video, so it starts muted. It carries
// the same two controls the looping films on the other studies do — a stop in
// the middle and the way out to YouTube — rather than the player's own bar, so
// every film on the site is operated the same way.
//
// It used to wait for the player to be nine tenths on screen before mounting.
// On a case study the film sits under a title, a standfirst and a row of
// credits, so at the top of the page it never was: the reader was met by an
// empty grey box where the work should have been. The observer is still here,
// but only to stop the film when it is scrolled away from.
//
// The moment they touch the player, the scroll observer stops issuing commands.
// Otherwise scrolling a little would pause a video someone had deliberately
// started, which is worse than never having autoplayed it at all.

import { useCallback, useEffect, useRef, useState } from 'react'
import { ClipGlyph } from './projects/film-loop'

/**
 * How much of the player has to be on screen for it to run, and how little
 * before it is stopped. Two figures rather than one: a single threshold on a
 * player this size flickers between playing and paused as the page settles,
 * and — worse — a film sitting under a title and a row of credits is never
 * nine tenths visible at the top of the page, so one threshold set high enough
 * to mean "being watched" also means "pause it the moment it loads".
 */
const PLAY_AT = 0.45
const PAUSE_AT = 0.1

type Props = {
  /** The `v=` value from the watch URL. */
  id: string
  /** Used as the iframe's accessible name. */
  title: string
}

export default function YoutubeEmbed({ id, title }: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  /** Set once the viewer takes manual control; we stop steering after that. */
  const viewerDriving = useRef(false)
  /** Stopped by hand. */
  const [held, setHeld] = useState(false)
  /** Silent until asked otherwise, which is also the only way it may autoplay. */
  const [muted, setMuted] = useState(true)

  const send = useCallback((func: 'playVideo' | 'pauseVideo' | 'mute' | 'unMute') => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      'https://www.youtube.com'
    )
  }, [])

  const toggle = useCallback(() => {
    viewerDriving.current = true
    setHeld((was) => {
      send(was ? 'playVideo' : 'pauseVideo')
      return !was
    })
  }, [send])

  const toggleSound = useCallback(() => {
    setMuted((was) => {
      send(was ? 'unMute' : 'mute')
      return !was
    })
  }, [send])

  const command = useCallback((func: 'playVideo' | 'pauseVideo') => {
    if (viewerDriving.current) return
    send(func)
  }, [send])

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
        if (viewerDriving.current) return

        // A player taller than the window can never be mostly visible, so it
        // also counts as being watched once it fills most of the screen.
        const fillsScreen =
          entry.intersectionRect.height >= window.innerHeight * 0.85

        // The iframe is mounted and playing from the start; the observer's only
        // job is to stop the film once it has been scrolled away from and to
        // start it again on the way back. Anything between the two figures is
        // left exactly as it is.
        if (entry.intersectionRatio >= PLAY_AT || fillsScreen) {
          command('playVideo')
        } else if (entry.intersectionRatio <= PAUSE_AT) {
          command('pauseVideo')
        }
      },
      { threshold: [0, PAUSE_AT, 0.25, PLAY_AT, 0.75, 1] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [command])

  const src =
    `https://www.youtube.com/embed/${encodeURIComponent(id)}` +
    // controls=0: the film carries the site's own pair instead of the
    // player's bar, so every one of them is operated the same way
    '?autoplay=1&mute=1&controls=0&fs=0&enablejsapi=1&playsinline=1&rel=0&modestbranding=1'

  // Rendered outright rather than swapped in once something has been observed:
  // the frame reserves its own 16:9 box in the stylesheet, so there is nothing
  // to hold the place of and nothing to shift when the player arrives.
  return (
    <div className="case-video" ref={frameRef}>
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; web-share; fullscreen"
        allowFullScreen
      />
      <div className="case-clip-controls">
        <button type="button" className="case-clip-stop" onClick={toggle}>
          <ClipGlyph held={held} />
          <span className="visually-hidden">
            {held ? 'Play' : 'Pause'} {title}
          </span>
        </button>
        <button type="button" className="case-clip-sound" onClick={toggleSound}>
          <SoundGlyph muted={muted} />
          <span className="visually-hidden">
            {muted ? 'Unmute' : 'Mute'} {title}
          </span>
        </button>
        <a
          className="case-clip-open"
          href={`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">Watch on YouTube</span>
          <span className="visually-hidden">
            Watch {title} on YouTube — opens in a new tab
          </span>
        </a>
      </div>
    </div>
  )
}

/** A speaker, struck through while it is silent. */
export function SoundGlyph({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4Z"
        fill="currentColor"
      />
      {muted ? (
        <path
          d="M15.5 9.5 20.5 14.5M20.5 9.5 15.5 14.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M15.4 9.1a4.1 4.1 0 0 1 0 5.8M18 6.6a7.7 7.7 0 0 1 0 10.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}
