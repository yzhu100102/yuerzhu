// The mark.
//
// One copy of the path lives in the document, dropped in by the root layout;
// every mark on the page is a `<use>` pointing at it. Drawn in `currentColor`,
// so it takes the colour of whatever it is set beside — white on the black
// screens, ink on the white ones, blue wherever the accent is.

import { KNOT_BOX, KNOT_PATH, KNOT_STROKE } from './knot-path'

/** The one copy. Rendered once, at the top of the body, and drawn nowhere. */
export function KnotDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <symbol id="knot" viewBox={`0 0 ${KNOT_BOX} ${KNOT_BOX}`}>
        <path
          d={KNOT_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={KNOT_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </symbol>
    </svg>
  )
}

export default function Knot({ className = '' }: { className?: string }) {
  return (
    <svg className={`knot ${className}`.trim()} aria-hidden="true" focusable="false">
      <use href="#knot" />
    </svg>
  )
}
