// The Yara mark shown at the three stages it was made in, rather than three
// unrelated tool logos: the same carrot-derived shape sketched, then drawn as
// vectors, then set moving. Palette matches the kinetic states.

const ORANGE = '#F98B5A'
const GREEN = '#007B61'
const CREAM = '#FFF6DC'
const PENCIL = '#B9B4AE'

/** The mark itself, reused at every stage. */
function Mark({ solid = true }: { solid?: boolean }) {
  return solid ? (
    <g>
      <rect x="34" y="40" width="52" height="52" rx="16" fill={ORANGE} />
      <path d="M34 56v-8a8 8 0 0 1 8-8h10v8a8 8 0 0 1-8 8z" fill={GREEN} />
      <rect x="46" y="62" width="28" height="7" rx="3.5" fill={CREAM} />
    </g>
  ) : (
    <g fill="none" stroke={ORANGE} strokeWidth="3">
      <rect x="34" y="40" width="52" height="52" rx="16" strokeDasharray="7 6" />
      <path d="M34 56v-8a8 8 0 0 1 8-8h10v8a8 8 0 0 1-8 8z" stroke={GREEN} strokeDasharray="5 5" />
      <rect x="46" y="62" width="28" height="7" rx="3.5" strokeDasharray="5 5" />
    </g>
  )
}

/** Figma: the shape still being worked out. */
function Sketched() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="The Yara mark as a dashed sketch, with a pencil">
      {/* discarded strokes around the shape */}
      <g stroke={PENCIL} strokeWidth="2.5" strokeLinecap="round" opacity="0.65">
        <path d="M28 34c6-4 12-5 18-4" />
        <path d="M92 92c-5 4-10 6-16 6" />
      </g>
      <Mark solid={false} />
      {/* pencil */}
      <g transform="rotate(38 96 96)">
        <rect x="88" y="76" width="11" height="30" rx="3" fill={PENCIL} />
        <path d="M88 106h11l-5.5 10z" fill={GREEN} />
      </g>
    </svg>
  )
}

/** Illustrator: the shape committed to vectors. */
function Drawn() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="The Yara mark drawn as vectors, with bezier anchor points">
      <Mark />
      {/* anchor points on the bounding box */}
      <g fill="#ffffff" stroke={GREEN} strokeWidth="2.5">
        <rect x="29" y="35" width="10" height="10" />
        <rect x="81" y="35" width="10" height="10" />
        <rect x="29" y="87" width="10" height="10" />
        <rect x="81" y="87" width="10" height="10" />
      </g>
      {/* one handle pulled out */}
      <g stroke={GREEN} strokeWidth="2.5" fill="none">
        <path d="M91 40h18" />
      </g>
      <circle cx="110" cy="40" r="4.5" fill={GREEN} />
    </svg>
  )
}

/** After Effects: the shape set moving. */
function Animated() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="The Yara mark with a motion trail and keyframes">
      {/* trail: the same silhouette, ghosted, easing in */}
      <rect x="8" y="46" width="40" height="40" rx="12" fill={ORANGE} opacity="0.18" />
      <rect x="20" y="44" width="46" height="46" rx="14" fill={ORANGE} opacity="0.32" />
      <g transform="translate(6 -4)">
        <Mark />
      </g>
      {/* keyframes on a timeline */}
      <g fill={GREEN}>
        <path d="M20 108l5-5 5 5-5 5z" />
        <path d="M58 108l5-5 5 5-5 5z" />
        <path d="M96 108l5-5 5 5-5 5z" />
      </g>
      <path d="M25 108h76" stroke={GREEN} strokeWidth="2" opacity="0.35" />
    </svg>
  )
}

const stages = [
  { Icon: Sketched, label: 'Sketched in Figma' },
  { Icon: Drawn, label: 'Drawn in Illustrator' },
  { Icon: Animated, label: 'Animated in After Effects' },
]

export default function CraftIcons() {
  return (
    <div className="case-icons">
      {stages.map(({ Icon, label }) => (
        <figure className="case-icon" key={label}>
          <Icon />
          <figcaption className="case-icon-title">{label}</figcaption>
        </figure>
      ))}
    </div>
  )
}
