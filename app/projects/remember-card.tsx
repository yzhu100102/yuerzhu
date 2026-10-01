'use client'

// Notes which project is open, for the work to pick up when the reader goes
// back to it.
//
// This sits in the projects layout rather than in each case study, so a study
// added later is remembered without anyone having to think about it. The
// layout itself is not re-rendered on navigation, but this is a client
// component subscribed to the router, so it does re-run as the reader moves
// from one project to the next.
//
// Recorded on arrival rather than on the way out: a page being navigated away
// from cannot count on a cleanup running, and arriving is the moment we
// certainly know about.

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { LAST_PROJECT } from '../last-project'

export default function RememberCard() {
  const pathname = usePathname()

  useEffect(() => {
    try {
      sessionStorage.setItem(LAST_PROJECT, pathname)
    } catch {
      // a browser with storage turned off simply does not remember
    }
  }, [pathname])

  // Nothing is rendered, which also means the pathname never reaches the
  // markup — so there is nothing here for a redirect to leave mismatched
  // between what the server drew and where the browser ended up.
  return null
}
