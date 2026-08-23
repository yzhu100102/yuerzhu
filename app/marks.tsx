// The small marks that sit in front of a word.
//
// Line drawings in `currentColor` and nothing else: they take the colour of
// whatever they are set beside, and on a link they turn white with the letters
// when the field runs under them. Everything is drawn on a 24 grid so one
// stroke width holds across the set — see `.mark` for the size they are set at.

/**
 * An Archimedean spiral, as a polyline. A kouign-amann is sugar and butter
 * folded round and round on itself, and a drawn spiral is the one shape that
 * still reads at the size a word is set at — arcs eyeballed by hand come out
 * as a snail.
 */
function spiralPath(turns = 2.35, radius = 6.4, steps = 96) {
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * turns * Math.PI * 2
    const r = (i / steps) * radius
    points.push(
      `${(12 + r * Math.cos(angle)).toFixed(2)},${(12 + r * Math.sin(angle)).toFixed(2)}`
    )
  }
  return `M${points.join('L')}`
}

const SPIRAL = spiralPath()

export type MarkName =
  | 'cake'
  | 'racket'
  | 'mountain'
  | 'vase'
  | 'spiral'
  | 'screen'

const MARKS: Record<MarkName, React.ReactNode> = {
  // a layer with icing running off it, one candle lit
  cake: (
    <>
      <path d="M3.8 20.6h16.4" />
      <path d="M5.6 20.6v-8.2h12.8v8.2" />
      <path d="M5.6 14.8c1.07 0 1.07 1.25 2.13 1.25s1.07-1.25 2.14-1.25 1.06 1.25 2.13 1.25 1.07-1.25 2.13-1.25 1.07 1.25 2.14 1.25 1.06-1.25 2.13-1.25" />
      <path d="M12 12.4V9.6" />
      <path d="M12 6.4c1.3 1.2 1.3 3.2 0 3.2s-1.3-2 0-3.2z" />
    </>
  ),
  // strung head, handle, and the ball beside it
  racket: (
    <>
      <ellipse cx="10.6" cy="8.9" rx="5.4" ry="6.4" />
      <path d="M5.4 8.9h10.4M10.6 3.1v11.6" />
      <path d="M9.2 15.1 6.9 20.9" />
      <circle cx="18.4" cy="18.4" r="1.9" />
    </>
  ),
  // two peaks off one ridge, and the sun over them
  mountain: (
    <>
      <path d="M2.4 19.8h19.2" />
      <path d="M2.4 19.8 9.3 8.4l3.5 5.6 2.2-3.2 6.6 9z" />
      <circle cx="17.6" cy="5.3" r="2.1" />
    </>
  ),
  // A thrown vessel: a lip, a neck, and a belly wide enough that the silhouette
  // still reads as a pot at the size a word is set at.
  vase: (
    <>
      <path d="M8.6 3.6h6.8" />
      <path d="M9.4 3.6c0 2.4-5.2 3.6-5.2 9.1 0 4.4 3.5 7.7 7.8 7.7s7.8-3.3 7.8-7.7c0-5.5-5.2-6.7-5.2-9.1" />
    </>
  ),
  // sugar turned in on itself, inside the round it is baked in
  spiral: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d={SPIRAL} />
    </>
  ),
  // a screen on its stand: the wider one this is all meant to be seen on
  screen: (
    <>
      <rect x="2.4" y="4" width="19.2" height="13.2" rx="2.2" />
      <path d="M12 17.2V21M8.8 21h6.4" />
    </>
  ),
}

export default function Mark({ name }: { name: MarkName }) {
  return (
    <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
      {MARKS[name]}
    </svg>
  )
}
