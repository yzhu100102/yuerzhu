// Three spot illustrations for the research concerns, drawn in Yummly's palette
// — orange #F98B5A, green #007B61, cream #FFF6DC — to sit with the kinetic
// states. Inline SVG rather than exported artwork so they stay crisp at any
// size and the colours can be edited in place.

const ORANGE = '#F98B5A'
const GREEN = '#007B61'
const CREAM = '#FFF6DC'

/** A phone, and the hand that would rather not be holding it. */
function PhoneInHand() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="A hand holding a phone">
      {/* fingers, behind the phone */}
      <g fill={ORANGE}>
        <rect x="74" y="46" width="22" height="10" rx="5" />
        <rect x="74" y="61" width="19" height="10" rx="5" />
      </g>
      {/* phone, tipped the way a hand actually holds one */}
      <g transform="rotate(-6 60 58)">
        <rect x="37" y="10" width="46" height="80" rx="11" fill={GREEN} />
        <rect x="42" y="16" width="36" height="62" rx="6" fill={CREAM} />
      </g>
      {/* palm, narrower than the phone so the phone reads as sitting in it */}
      <path
        d="M42 80h30a13 13 0 0 1 13 13v5a14 14 0 0 1-14 14H43a14 14 0 0 1-14-14v-5a13 13 0 0 1 13-13z"
        fill={ORANGE}
      />
      {/* thumb, laid across the lower screen */}
      <rect
        x="30"
        y="60"
        width="34"
        height="13"
        rx="6.5"
        fill={ORANGE}
        transform="rotate(-20 47 66)"
      />
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
    Icon: PhoneInHand,
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
