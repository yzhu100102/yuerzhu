// A film on YouTube, cut to the stretches worth watching and run round and
// round.
//
// This drives the player rather than using a <video>: the cuts are played back
// to back and then from the top again, muted, and only while the visual is
// actually on screen. The player is left uninteractive on purpose — it is a
// loop on a case study page, not something to scrub, and a stray click would
// drop it out of the cut.
'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

/** A stretch of the film, in seconds on its own clock. */
export type Cut = {
  from: number
  /**
   * Where it closes, or `'end'` to run to just short of where the film
   * finishes — letting a film actually end brings up YouTube's own
   * suggestions over the last frame.
   */
  to: number | 'end'
}

/** How far short of the end `'end'` stops. */
const SHORT_OF_END = 0.4

/** What a film uploaded to YouTube is framed in, whatever shape it was shot. */
const UPLOAD = 9 / 16

/**
 * The letterbox the player's furniture needs, as a share of the window's
 * width. The title bar and the end screen sit against the player's own top and
 * bottom edges, so running it taller than the film puts them in the black
 * either side of the picture, out of the window.
 */
const FURNITURE = 0.104

/** How often the playhead is read, in milliseconds. */
const WATCH = 120

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

type Props = {
  /** the film's YouTube id */
  film: string
  /** the stretches to play, in the order they should run */
  cuts: Cut[]
  /** what the film shows, for anything not watching it */
  label: string
  /**
   * The shape of the picture, where that is not the 16:9 of the file holding
   * it. A film mastered wider — 2:1, say — is uploaded inside a 16:9 frame
   * with black bars added top and bottom, and the only way to be rid of them
   * is to give the window the picture's own shape rather than the file's.
   */
  ratio?: number
  /** the opening picture of the study, rather than one in the copy column */
  hero?: boolean
}

export default function FilmLoop({ film, cuts, label, ratio = 16 / 9, hero }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const holderRef = useRef<HTMLElement>(null)
  // The cuts arrive as a literal, which is a new array on every render. Held
  // as text so the effect below depends on what they say rather than on the
  // identity of the array, and the player is not torn down and rebuilt each
  // time the page re-renders.
  const plan = JSON.stringify(cuts)

  useEffect(() => {
    const list: Cut[] = JSON.parse(plan)
    const frame = frameRef.current
    const holder = holderRef.current
    if (!frame || !holder) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const opens = list[0]?.from ?? 0
    let player: Player | null = null
    let watch = 0
    let seen = false
    let gone = false
    /**
     * Which cut is running. The playhead lags a seek by a moment, so without
     * holding this the turn fires again and again and the player shows its
     * buffering glyph each time. It is moved on *before* the seek, so the next
     * read is already asking about the cut being seeked to.
     */
    let at = 0

    api().then((YT) => {
      if (gone) return
      player = new YT.Player(frame, {
        videoId: film,
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
          start: Math.floor(opens),
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            player?.mute()
            player?.seekTo(opens, true)
            if (seen && !still) player?.playVideo()
            // No cut but the last announces its own close, so every one of
            // them is watched for instead.
            watch = window.setInterval(() => {
              if (!player) return
              const cut = list[at]
              if (!cut) return
              const runs = player.getDuration()
              const closes =
                cut.to === 'end'
                  ? runs > 0
                    ? runs - SHORT_OF_END
                    : Number.POSITIVE_INFINITY
                  : cut.to
              if (player.getCurrentTime() < closes) return
              at = (at + 1) % list.length
              player.seekTo(list[at].from, true)
              player.playVideo()
            }, WATCH)
          },
          // A safety net: the turn above should get there first.
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              at = 0
              player?.seekTo(opens, true)
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
  }, [film, plan])

  // The player is run taller than the picture so its furniture falls outside
  // the window. How much taller depends on the window's own shape, which is
  // why this is worked out here rather than written into the stylesheet — at
  // 16:9 it comes to the 137% a full-frame film has always used.
  const frame = {
    '--clip-ratio': String(ratio),
    '--clip-height': `${Math.round((UPLOAD + 2 * FURNITURE) * ratio * 100)}%`,
  } as CSSProperties

  return (
    <figure
      className={`case-media case-clip${hero ? ' case-clip--hero' : ''}`}
      style={frame}
      ref={holderRef}
      aria-label={label}
      role="img"
    >
      <div className="case-clip-frame" ref={frameRef} />
    </figure>
  )
}
