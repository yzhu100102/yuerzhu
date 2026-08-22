// The brief, set as a composed panel: the question centred, with turns of
// dialogue, two dishes drawn like the app's recipe cards, a timer, and Yara
// listening scattered around it.

const ORANGE = '#F98B5A'
const GREEN = '#007B61'
const CREAM = '#FFF6DC'
const GREY = '#E9E6E2'
const MUTED = '#C4BDB5'

/** Their turn. */
function BubbleIn() {
  return (
    <svg viewBox="0 0 100 68" aria-hidden="true">
      <path d="M14 4h72a12 12 0 0 1 12 12v24a12 12 0 0 1-12 12H36L18 64l4-12h-8A12 12 0 0 1 2 40V16A12 12 0 0 1 14 4z" fill={GREY} />
      <rect x="16" y="18" width="52" height="6" rx="3" fill={MUTED} />
      <rect x="16" y="32" width="34" height="6" rx="3" fill={MUTED} />
    </svg>
  )
}

/** Yara's turn. */
function BubbleOut() {
  return (
    <svg viewBox="0 0 100 68" aria-hidden="true">
      <path d="M86 4H14A12 12 0 0 0 2 16v24a12 12 0 0 0 12 12h50l18 12-4-12h8a12 12 0 0 0 12-12V16A12 12 0 0 0 86 4z" fill={ORANGE} />
      <rect x="18" y="18" width="46" height="6" rx="3" fill={CREAM} />
      <rect x="18" y="32" width="28" height="6" rx="3" fill={CREAM} />
    </svg>
  )
}

/** A bowl of pasta, drawn like the recipe cards in the app. */
function PastaBowl() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#F6E7BC" />
      <circle cx="50" cy="50" r="33" fill="#FBF3D8" />
      <g stroke="#EBD79F" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M27 46c8-7 16 6 24-1s14 5 22-2" />
        <path d="M26 55c8-7 16 6 24-1s14 5 23-2" />
        <path d="M29 64c7-6 15 5 22-1s13 4 20-2" />
      </g>
      <circle cx="41" cy="41" r="4" fill="#007B61" />
      <circle cx="63" cy="58" r="3.4" fill="#007B61" />
      <circle cx="52" cy="68" r="3" fill="#F98B5A" />
    </svg>
  )
}

/** A ramen bowl: broth, egg, scallions. */
function RamenBowl() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#E9764A" />
      <circle cx="50" cy="50" r="33" fill="#F98B5A" />
      <g stroke="#FFF6DC" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M28 58c7-6 15 5 22-1s13 4 21-2" />
        <path d="M30 67c7-6 14 5 21-1s12 4 19-2" />
      </g>
      {/* egg */}
      <circle cx="38" cy="41" r="11" fill="#FFF6DC" />
      <circle cx="38" cy="41" r="5.5" fill="#F5B942" />
      {/* scallions */}
      <circle cx="63" cy="38" r="4.5" fill="#007B61" />
      <circle cx="63" cy="38" r="2" fill="#8FC9AF" />
      <circle cx="70" cy="52" r="4" fill="#007B61" />
      <circle cx="70" cy="52" r="1.8" fill="#8FC9AF" />
    </svg>
  )
}

/** Something on the hob, counting down. */
function Timer() {
  return (
    <svg viewBox="0 0 68 68" aria-hidden="true">
      <circle cx="34" cy="38" r="26" fill={CREAM} stroke={GREEN} strokeWidth="4" />
      <rect x="27" y="4" width="14" height="7" rx="3.5" fill={GREEN} />
      <path d="M34 12a26 26 0 0 1 22 39" stroke={ORANGE} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M34 38V24M34 38l10 7" stroke={GREEN} strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** Yara, listening. */
function Listening() {
  return (
    <svg viewBox="0 0 68 68" aria-hidden="true">
      <rect x="14" y="14" width="44" height="44" rx="14" fill={ORANGE} />
      <path d="M14 27v-5a8 8 0 0 1 8-8h9v5a8 8 0 0 1-8 8z" fill={GREEN} />
      <ellipse cx="38" cy="38" rx="13" ry="10" fill="#FBB894" />
    </svg>
  )
}

const pieces = [
  { Piece: BubbleIn, className: 'brief-art--in' },
  { Piece: BubbleOut, className: 'brief-art--out' },
  { Piece: PastaBowl, className: 'brief-art--pasta' },
  { Piece: RamenBowl, className: 'brief-art--ramen' },
  { Piece: Timer, className: 'brief-art--timer' },
  { Piece: Listening, className: 'brief-art--listening' },
]

export default function BriefGraphic() {
  return (
    <div className="brief-art">
      {pieces.map(({ Piece, className }) => (
        <span className={`brief-art-piece ${className}`} key={className}>
          <Piece />
        </span>
      ))}
      <p className="brief-art-question">
        Cooking is rarely the only thing happening.
      </p>
    </div>
  )
}
