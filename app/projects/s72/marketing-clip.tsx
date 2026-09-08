// The marketing film, cut to the two stretches that show the feature.
//
// The film is on YouTube, so this drives its player rather than a <video>:
// two segments played back to back and then round again, muted, and only while
// the visual is actually on screen. The player is left uninteractive on
// purpose — it is a loop on a case study page, not something to scrub, and a
// stray click would drop it out of the cut.
'use client'

import { useEffect, useRef } from 'react'

const FILM = 'ZC1eqHgkP-4'

// Seconds on the film's own clock. The second cut runs to the end — but it
// turns back just short of it, because letting the film actually end brings up
// YouTube's own suggestions over the last frame.
const OPENS = 9
const CLOSES = 18
const RESUMES = 71
const SHORT_OF_END = 0.4

// What this uses of the IFrame API, rather than the whole of it.
type Player = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  mute: () => void
  destroy: () => void
}

type Api = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      host?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (event: { data: number }) => void
      }
    },
  ) => Player
  PlayerState: { ENDED: number }
}

declare global {
  interface Window {
    YT?: Api
    onYouTubeIframeAPIReady?: () => void
  }
}

// One script for the page however many players ask for it.
let loading: Promise<Api> | null = null

function api(): Promise<Api> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (loading) return loading
  loading = new Promise<Api>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT as Api)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.append(script)
  })
  return loading
}

export default function MarketingClip({ label }: { label: string }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const holderRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    const holder = holderRef.current
    if (!frame || !holder) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let player: Player | null = null
    let watch = 0
    let seen = false
    let gone = false
    // which of the two cuts is running: the playhead lags a seek by a moment,
    // so without this the turn fires again and again and the player shows its
    // buffering glyph each time
    let cut = 0

    api().then((YT) => {
      if (gone) return
      player = new YT.Player(frame, {
        videoId: FILM,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          mute: 1,
          start: OPENS,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            player?.mute()
            player?.seekTo(OPENS, true)
            if (seen && !still) player?.playVideo()
            // The first cut has no end of its own to announce, so its close is
            // watched for; the second ends when the film does.
            watch = window.setInterval(() => {
              if (!player) return
              const at = player.getCurrentTime()
              const runs = player.getDuration()
              if (cut === 0 && at >= CLOSES) {
                cut = 1
                player.seekTo(RESUMES, true)
                player.playVideo()
              } else if (cut === 1 && runs > 0 && at >= runs - SHORT_OF_END) {
                cut = 0
                player.seekTo(OPENS, true)
                player.playVideo()
              }
            }, 120)
          },
          // A safety net: the turn above should get there first.
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              cut = 0
              player?.seekTo(OPENS, true)
              if (seen && !still) player?.playVideo()
            }
          },
        },
      })
    })

    // It runs while it is being looked at, and stops when it is not.
    const eye = new IntersectionObserver(
      ([entry]) => {
        seen = entry.isIntersecting
        if (still) return
        if (seen) player?.playVideo()
        else player?.pauseVideo()
      },
      { threshold: 0.3 },
    )
    eye.observe(holder)

    return () => {
      gone = true
      eye.disconnect()
      window.clearInterval(watch)
      player?.destroy()
    }
  }, [])

  return (
    <figure className="case-media case-clip" ref={holderRef} aria-label={label} role="img">
      <div className="case-clip-frame" ref={frameRef} />
    </figure>
  )
}
