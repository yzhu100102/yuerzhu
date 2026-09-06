// The system the app sits inside, and where this work starts.
//
// Three devices with the signal running through them, drawn rather than
// photographed so the emphasis can be placed: the phone is in the Alpha orange
// and stands larger than the two it hands off to, because the phone is the only
// one of the three this case study is about.

const STROKE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Arrow() {
  return (
    <svg className="case-flow-arrow" viewBox="0 0 40 16" aria-hidden="true" {...STROKE}>
      <path d="M2 8h29" />
      <path d="M25 3l6 5-6 5" />
    </svg>
  )
}

export default function DeviceFlow() {
  return (
    <figure className="case-flow">
      <div className="case-flow-row">
        <div className="case-flow-step case-flow-step--focus">
          <svg viewBox="0 0 64 64" role="img" aria-label="Phone" {...STROKE}>
            <rect x="19" y="5" width="26" height="54" rx="5" />
            <path d="M28 12h8" />
            <path d="M28 52h8" />
          </svg>
          <span className="case-flow-label">Step 1: App Redesign</span>
        </div>

        <Arrow />

        <div className="case-flow-step">
          <svg viewBox="0 0 64 64" role="img" aria-label="Handheld" {...STROKE}>
            <path d="M44 15l8-10" />
            <rect x="14" y="15" width="30" height="45" rx="6" />
            <rect x="20" y="21" width="18" height="15" rx="2" />
            <circle cx="24" cy="45" r="2.2" />
            <circle cx="34" cy="45" r="2.2" />
            <circle cx="24" cy="53" r="2.2" />
            <circle cx="34" cy="53" r="2.2" />
          </svg>
        </div>

        <Arrow />

        <div className="case-flow-step">
          {/* the strap is broken where the unit sits on it, so the unit reads
              as mounted rather than balanced on top */}
          <svg viewBox="0 0 64 64" role="img" aria-label="Dog collar" {...STROKE}>
            <path d="M41 17l8-8" />
            <path d="M22 30A20 14 0 1 0 42 30" />
            <rect x="22" y="16" width="20" height="14" rx="3" />
            <path d="M28 23h8" />
          </svg>
        </div>
      </div>
    </figure>
  )
}
