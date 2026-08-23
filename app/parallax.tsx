'use client'

// Site-wide parallax.
//
// Anything carrying `data-parallax` is measured against the window on every
// scroll and handed a `--py` — how far it should sit off where the page put it.
// The stylesheet decides what to do with the figure: a block moves itself, a
// frame marked `.parallax-in` moves the picture inside it instead, so the
// crop travels while the frame stays where the layout left it.
//
// Nothing is written to React state: the figures go straight onto the elements
// inside one animation frame, so a page re-render never sits in the way of a
// scroll.

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * How far a thing drifts when it does not say, as a fraction of the window's
 * height across one full pass of the screen. Small on purpose: this is meant to
 * be felt rather than watched.
 */
const DEFAULT_DEPTH = 0.06

export default function Parallax() {
  // the layout outlives a route change, so the set of parallaxed things has to
  // be gathered again whenever the page under it swaps
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let items: { el: HTMLElement; depth: number }[] = []
    let raf = 0

    const collect = () => {
      items = Array.from(
        document.querySelectorAll<HTMLElement>('[data-parallax]')
      ).map((el) => {
        const depth = Number.parseFloat(el.dataset.parallax ?? '')
        return { el, depth: Number.isFinite(depth) ? depth : DEFAULT_DEPTH }
      })
    }

    const read = () => {
      raf = 0
      const view = window.innerHeight
      if (!view) return
      for (const { el, depth } of items) {
        const box = el.getBoundingClientRect()
        // an element off screen entirely has nothing to show, and a collapsed
        // one — a layout hidden at this width — has nothing to measure
        if (!box.height || box.bottom < 0 || box.top > view) continue
        // where the middle of it sits in the window: +0.5 as it leaves the top,
        // 0 across the centre line, -0.5 as it arrives at the bottom
        const past = 0.5 - (box.top + box.height / 2) / view
        // moved back the way it came, so it lags the page rather than leading it
        el.style.setProperty('--py', `${(past * depth * view).toFixed(1)}px`)
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }

    const onResize = () => {
      collect()
      onScroll()
    }

    collect()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [pathname])

  return null
}
