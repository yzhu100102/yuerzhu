'use client'

// Things arrive as they are scrolled to: pictures travel in from alternating
// sides, copy fades up from below a line at a time.
//
// Only what is below the fold when this runs is ever touched. Anything already
// on screen keeps exactly what the server painted, so nothing the reader has
// already seen flashes out and animates back in.

import { useEffect } from 'react'

/** Pictures, film and panels — these come in from the side. */
const MEDIA = [
  '.project-card',
  '.case-ph',
  '.case-video',
  '.feature-video',
  '.cui-states',
  '.brief-art',
  '.case-icon svg',
  '.deep-dive svg',
  '.about-connect-badge',
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
  '.about-connect-lead',
  '.about-connect-name',
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
}

export default function ScrollReveal({ split = true }: Props) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /** Still below the fold, so it can be hidden without anything flashing. */
    const pending = (el: HTMLElement) =>
      el.getBoundingClientRect().top > window.innerHeight * 0.9

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
        splitIntoLines(el)
      } else {
        el.dataset.reveal = 'rise'
      }
      watched.push(el)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.revealIn = ''
          observer.unobserve(entry.target)
        }
      },
      // held off the bottom edge, so nothing arrives half off the screen
      { rootMargin: '0px 0px -10% 0px' }
    )

    watched.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [split])

  return null
}

/**
 * Rebuilds a paragraph out of one span per word, then hands every word the
 * delay of the line it landed on — so the paragraph arrives a line at a time
 * however the type happens to break at this width.
 */
function splitIntoLines(el: HTMLElement) {
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
    word.style.setProperty('--reveal-delay', `${(line * LINE_STEP).toFixed(3)}s`)
  }

  el.dataset.reveal = 'lines'
}
