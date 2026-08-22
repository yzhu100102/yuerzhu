// The three threads the process actually pulled on, each drawn in Yara's own
// language rather than as generic process symbols.

import { Fragment } from 'react'

const ORANGE = '#F98B5A'
const GREEN = '#007B61'
const CREAM = '#FFF6DC'
const GREY = '#EDEBE8'
const MUTED = '#C9C4BE'

/** Yara riding alongside a surface Yummly already owns. */
function SupportingRole() {
  return (
    <svg viewBox="0 0 120 100" role="img" aria-label="Yara's mark tucked beside an existing Yummly surface">
      {/* the meal plan / recommendations Yummly already runs */}
      <rect x="6" y="10" width="82" height="70" rx="12" fill={GREY} />
      <rect x="16" y="22" width="46" height="7" rx="3.5" fill={MUTED} />
      <rect x="16" y="38" width="62" height="7" rx="3.5" fill={MUTED} />
      <rect x="16" y="54" width="36" height="7" rx="3.5" fill={MUTED} />
      {/* Yara, second to it */}
      <rect x="68" y="52" width="42" height="42" rx="13" fill={ORANGE} />
      <path d="M68 64v-6a6 6 0 0 1 6-6h8v6a6 6 0 0 1-6 6z" fill={GREEN} />
      <rect x="78" y="70" width="22" height="6" rx="3" fill={CREAM} />
    </svg>
  )
}

/** Something going wrong, and Yara speaking into it. */
function MidCook() {
  return (
    <svg viewBox="0 0 120 100" role="img" aria-label="A pan going wrong with Yara speaking into it">
      {/* trouble */}
      <g stroke={MUTED} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M22 50c5-5 0-9 0-14" />
        <path d="M40 48c5-5 0-9 0-14" />
      </g>
      <rect x="8" y="58" width="46" height="28" rx="10" fill={GREEN} />
      <rect x="0" y="65" width="10" height="6" rx="3" fill={GREEN} />
      {/* Yara stepping in */}
      <path d="M114 14H66a10 10 0 0 0-10 10v18a10 10 0 0 0 10 10h10l-4 12 16-12h26a10 10 0 0 0 10-10V24a10 10 0 0 0-10-10z" fill={ORANGE} />
      <rect x="82" y="22" width="7" height="16" rx="3.5" fill={CREAM} />
      <circle cx="85.5" cy="44" r="4" fill={CREAM} />
    </svg>
  )
}

/** Yara reaching past the phone into the appliances around it. */
function ConnectedKitchen() {
  return (
    <svg viewBox="0 0 120 100" role="img" aria-label="Yara connecting outward to a hob">
      {/* Yara */}
      <rect x="4" y="30" width="38" height="38" rx="12" fill={ORANGE} />
      <path d="M4 41v-5a6 6 0 0 1 6-6h7v5a6 6 0 0 1-6 6z" fill={GREEN} />
      <rect x="13" y="46" width="20" height="6" rx="3" fill={CREAM} />
      {/* signal */}
      <g stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M50 42a12 12 0 0 1 0 14" />
        <path d="M58 36a22 22 0 0 1 0 26" />
      </g>
      {/* the hob */}
      <rect x="72" y="26" width="46" height="46" rx="12" fill={CREAM} stroke={GREEN} strokeWidth="3.5" />
      <circle cx="86" cy="40" r="6" fill={ORANGE} />
      <circle cx="104" cy="40" r="6" fill={GREEN} />
      <rect x="80" y="56" width="32" height="6" rx="3" fill={MUTED} />
    </svg>
  )
}

const dives = [
  {
    Icon: SupportingRole,
    title: 'A supporting role',
    question: (
      <>
        How can Yara <mark className="hl">build on</mark> the recommendations and
        meal planning Yummly already does, rather than duplicate them?
      </>
    ),
  },
  {
    Icon: MidCook,
    title: 'Recovery mid-cook',
    question: (
      <>
        How can Yara step in{' '}
        <mark className="hl">when something goes wrong</mark>, without taking the
        cook’s hands or attention?
      </>
    ),
  },
  {
    Icon: ConnectedKitchen,
    title: 'Reaching the kitchen',
    question: (
      <>
        Where can Yara reach <mark className="hl">past the phone</mark>, into the
        appliances and inventory around it?
      </>
    ),
  },
]

function Chevron() {
  return (
    <span className="deep-dive-step" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M8 4l9 8-9 8" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function DeepDives() {
  return (
    <div className="deep-dives">
      {dives.map(({ Icon, title, question }, i) => (
        <Fragment key={title}>
          {i > 0 && <Chevron />}
          <figure className="deep-dive">
            <span className="deep-dive-number">
              DEEP DIVE {String(i + 1).padStart(2, '0')}
            </span>
            <Icon />
            <figcaption>
              <h3 className="deep-dive-title">{title}</h3>
              <p className="deep-dive-note">{question}</p>
            </figcaption>
          </figure>
        </Fragment>
      ))}
    </div>
  )
}
