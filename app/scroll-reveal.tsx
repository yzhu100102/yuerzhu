'use client'

// Things arrive as they are scrolled to: pictures travel in from alternating
// sides, copy fades up from below a line at a time.
//
// Only what is below the fold when this runs is ever touched. Anything already
// on screen keeps exactly what the server painted, so nothing the reader has
// already seen flashes out and animates back in.

import { useEffect, useLayoutEffect } from 'react'

/**
 * The work here has to happen before the browser paints, or a page that is
 * revealed from the top shows its copy once at full strength and then blinks
 * out to animate back in. On the server the component renders nothing, so
 * there is nothing for a layout effect to do and React is told as much.
 */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Pictures, film and panels — these come in from the side. */
const MEDIA = [
  '.project-card',
  '.case-ph',
  '.case-hero-image',
  '.case-video',
  '.feature-video',
  '.cui-states',
  '.brief-art',
  '.case-icon svg',
  '.deep-dive svg',
].join(',')

/** Copy — this fades up. */
const TEXT = [
  '.case-title',
  '.case-question',
  '.case-heading',
  '.case-lead',
  '.case-text',
  '.case-caption',
  '.case-meta-row',
  '.case-insight-number',
  '.case-insight-title',
  '.case-icon-title',
  '.case-icon-label',
  '.deep-dive-number',
  '.deep-dive-title',
  '.deep-dive-note',
  '.case-next',
  '.project-title',
  '.project-subheader',
].join(',')

/** The gap between one line of a paragraph arriving and the next. */
const LINE_STEP = 0.07

type Props = {
  /**
   * Whether paragraphs may be rebuilt word by word for the line-at-a-time
   * arrival. Off for pages whose copy sits in a subtree React re-renders —
   * taking those nodes apart underneath it is asking for trouble.
   */
  split?: boolean
  /** The gap between one line arriving and the next, if not the usual one. */
  step?: number
  /**
   * Where to keep this page's scroll position, if it should be kept at all.
   *
   * With it set the page opens at the top the first time and arrives — every
   * paragraph on it, not just the ones below the fold — and on any later visit
   * it opens exactly where it was left, with nothing animating, because
   * replaying an entrance for someone who is only coming back to where they
   * were is a page taking itself away from them.
   */
  restoreKey?: string
}

export default function ScrollReveal({
  split = true,
  step = LINE_STEP,
  restoreKey,
}: Props) {
  useBeforePaint(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Put the reader back before anything is measured: what counts as below
    // the fold depends on where the page is sitting.
    const returning = restoreKey ? restoreTo(restoreKey) : false

    /**
     * Whether this may be hidden without the reader seeing it go. Arriving
     * fresh at the top of a remembered page, that is everything — the whole
     * article is still to be read. Otherwise it is only what is below the fold.
     */
    const pending = (el: HTMLElement) =>
      restoreKey && !returning
        ? true
        : el.getBoundingClientRect().top > window.innerHeight * 0.9

    const watched: HTMLElement[] = []

    document.querySelectorAll<HTMLElement>(MEDIA).forEach((el, i) => {
      if (!pending(el)) return
      el.dataset.reveal = i % 2 === 0 ? 'left' : 'right'
      watched.push(el)
    })

    document.querySelectorAll<HTMLElement>(TEXT).forEach((el) => {
      if (!pending(el)) return
      // Only a paragraph of plain text is taken apart. One carrying a link or
      // an emphasis is left whole — rebuilding it would throw that markup away.
      if (split && el.children.length === 0 && el.textContent?.trim()) {
        splitIntoLines(el, step)
      } else {
        el.dataset.reveal = 'rise'
      }
      watched.push(el)
    })

    // Swept on scroll rather than watched by an IntersectionObserver.
    //
    // The observer only speaks when an element's share of the screen changes,
    // and a reader who jumps — the contents rail, a flung trackpad, a tap on
    // the scrollbar — can carry a paragraph from below the fold to above it
    // between two frames. Its share is nought on both sides of that jump, so
    // the observer says nothing and the paragraph stays invisible for as long
    // as the page is open. Asking every waiting element where it is instead
    // cannot miss one: anything that has come up past the line is revealed,
    // whether it arrived by scrolling or by being jumped over.
    let waiting = watched
    let raf = 0

    const sweep = () => {
      raf = 0
      // Held off the bottom edge, so nothing arrives half off the screen —
      // except at the foot of the document, where there is no more scrolling to
      // do and anything still sitting in that last tenth would wait for ever.
      const atTheEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      const line = window.innerHeight * (atTheEnd ? 1 : 0.9)
      waiting = waiting.filter((el) => {
        if (el.getBoundingClientRect().top > line) return true
        el.dataset.revealIn = ''
        return false
      })
      if (!waiting.length) stop()
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sweep)
    }

    const stop = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // the first pass runs on the next frame, once the page has been painted,
    // so whatever was already on screen arrives rather than simply being there
    onScroll()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      stop()
    }
  }, [split, step, restoreKey])

  // Remember where the reader got to, for the next time they open this page.
  useEffect(() => {
    if (!restoreKey) return
    let raf = 0
    const write = () => {
      raf = 0
      try {
        sessionStorage.setItem(restoreKey, String(Math.round(window.scrollY)))
      } catch {
        // a browser with storage turned off simply does not remember
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(write)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      write()
    }
  }, [restoreKey])

  return null
}

/**
 * Puts the reader back where they left this page, and says whether it had
 * anywhere to put them. The scroll is forced to happen at once: the site sets
 * `scroll-behavior: smooth`, which would otherwise walk them down the article
 * from the top rather than simply starting them where they were.
 */
function restoreTo(key: string) {
  let saved = 0
  try {
    saved = Number(sessionStorage.getItem(key)) || 0
  } catch {
    return false
  }

  const root = document.documentElement
  const behavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, saved > 0 ? saved : 0)
  root.style.scrollBehavior = behavior
  return saved > 0
}

/**
 * Rebuilds a paragraph out of one span per word, then hands every word the
 * delay of the line it landed on — so the paragraph arrives a line at a time
 * however the type happens to break at this width.
 */
function splitIntoLines(el: HTMLElement, step: number) {
  const source = el.textContent ?? ''
  const words: HTMLElement[] = []
  el.textContent = ''

  // the whitespace goes back in as it was, so the line breaks do not move
  for (const part of source.split(/(\s+)/)) {
    if (!part) continue
    if (/^\s+$/.test(part)) {
      el.appendChild(document.createTextNode(part))
      continue
    }
    const word = document.createElement('span')
    word.className = 'reveal-word'
    word.textContent = part
    el.appendChild(word)
    words.push(word)
  }

  let line = -1
  let top = Number.NaN
  for (const word of words) {
    if (word.offsetTop !== top) {
      top = word.offsetTop
      line += 1
    }
    word.style.setProperty('--reveal-delay', `${(line * step).toFixed(3)}s`)
  }

  el.dataset.reveal = 'lines'
}
