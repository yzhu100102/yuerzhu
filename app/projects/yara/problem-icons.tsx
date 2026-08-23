// Three spot illustrations for the research concerns, drawn in Yummly's palette
// — orange #F98B5A, green #007B61, cream #FFF6DC — to sit with the kinetic
// states. Inline SVG rather than exported artwork so they stay crisp at any
// size and the colours can be edited in place.

const ORANGE = '#F98B5A'
const GREEN = '#007B61'
const CREAM = '#FFF6DC'

/** A phone, and the print of the finger nobody wants to put on it. */
function Phone() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="A phone with a fingerprint on its screen">
      {/* the handset */}
      <rect x="33" y="8" width="54" height="104" rx="12" fill={GREEN} />
      {/* the screen */}
      <rect x="39" y="19" width="42" height="82" rx="5" fill={CREAM} />
      {/* earpiece */}
      <rect x="52" y="12.5" width="16" height="3" rx="1.5" fill={CREAM} />
      {/* The print: three ridges nested about one centre, open at the foot the
          way a print is, with the core ending short between them. Any more
          detail than this closes up at the size the illustration is set. */}
      <g fill="none" stroke={ORANGE} strokeWidth="2.6" strokeLinecap="round">
        <path d="M53.5 68V54.5a6.5 6.5 0 0 1 13 0V68" />
        <path d="M47 71V54.5a13 13 0 0 1 26 0V71" />
        <path d="M40.5 74V54.5a19.5 19.5 0 0 1 39 0V74" />
        <path d="M60 60v8" />
      </g>
    </svg>
  )
}

/** Steps that have to start hours or days before dinner. */
function Timing() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="A timer set ahead of a second timer">
      {/* the earlier, smaller dial */}
      <circle cx="28" cy="42" r="15" fill={ORANGE} />
      <path d="M28 34v8h6" stroke={CREAM} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* lead time */}
      <path d="M47 52h18" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" fill="none" />
      {/* the dial for now */}
      <circle cx="76" cy="70" r="30" fill={CREAM} stroke={GREEN} strokeWidth="3.5" />
      <rect x="69" y="34" width="14" height="7" rx="3.5" fill={GREEN} />
      {/* elapsed arc */}
      <path d="M76 40a30 30 0 0 1 26 45" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M76 70V54M76 70l12 8" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** No way to tell whether what is in the fridge is still usable. */
function StillGood() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="A jar with a question mark over it">
      <text
        x="60"
        y="34"
        textAnchor="middle"
        fill={ORANGE}
        fontSize="40"
        fontWeight="700"
        fontFamily="var(--font-sans)"
      >
        ?
      </text>
      {/* lid */}
      <rect x="34" y="44" width="52" height="15" rx="6" fill={GREEN} />
      {/* jar */}
      <rect x="39" y="57" width="42" height="46" rx="11" fill={CREAM} stroke={GREEN} strokeWidth="3.5" />
      {/* contents */}
      <path d="M45 84c6-5 10 3 16-1s10 3 15-2v13a6 6 0 0 1-6 6H51a6 6 0 0 1-6-6z" fill={ORANGE} />
    </svg>
  )
}

const concerns = [
  {
    Icon: Phone,
    title: 'I don\u2019t want to touch my phone right now.',
    note: 'Screens go dark mid-step. Phone gets greasy.',
  },
  {
    Icon: Timing,
    title: 'I forgot about the pasta.',
    note: 'Three things running at once, and one of them needed defrosting hours ago.',
  },
  {
    Icon: StillGood,
    title: 'Is this still good?',
    note: 'Herbs from some point last week. Not sure how to balance food waste from food poisoning.',
  },
]

export default function ProblemIcons() {
  return (
    <div className="case-icons">
      {concerns.map(({ Icon, title, note }) => (
        <figure className="case-icon" key={title}>
          <Icon />
          <figcaption>
            <h3 className="case-icon-title">{title}</h3>
            <p className="case-icon-label">{note}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
