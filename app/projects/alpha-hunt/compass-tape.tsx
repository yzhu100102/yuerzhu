// The compass tape, shared by the two panels that carry one.
//
// The artwork is 440 wide and the tape has to travel further than that, so it
// is laid out in degrees rather than drawn: a major tick every twenty degrees
// with two dots between them, a number every thirty, a point of the compass
// every forty-five, and the other saved waypoints as coloured dots at their own
// bearings. The whole track then slides behind the panel, which is what --tape
// on the stage is for: it holds where the tape's zero sits, so whatever heading
// the panel is describing ends up over the sight line.
//
// Read off the artwork: 30 pixels between major ticks, 20 degrees apart.
'use client'

import type { CSSProperties } from 'react'
import type { ReactNode } from 'react'

export const PER_DEG = 1.5

const at = (v: number) => ({ '--at': v }) as CSSProperties

// Drawn well past both edges of the window, so nothing runs out from under the
// tape however far it slides.
const FROM = -180
const TO = 420

const TICKS: { deg: number; major: boolean }[] = []
for (let d = FROM; d <= TO; d += 20) {
  TICKS.push({ deg: d, major: true })
  TICKS.push({ deg: d + 20 / 3, major: false })
  TICKS.push({ deg: d + 40 / 3, major: false })
}

const NUMBERS: number[] = []
for (let d = FROM; d <= TO; d += 30) NUMBERS.push(d)

const POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const CARDINALS: { deg: number; name: string }[] = []
for (let k = -4; k <= 9; k += 1) CARDINALS.push({ deg: k * 45, name: POINTS[((k % 8) + 8) % 8] })

// The other waypoints, at the bearings the tape artwork gives them.
const DOTS = [
  { deg: 313, tone: '#e9a826' },
  { deg: 322, tone: '#00b24c' },
  { deg: 9, tone: '#e9a826' },
  { deg: 20, tone: '#3fa9f5' },
  { deg: 177, tone: '#00b24c' },
  { deg: 203, tone: '#e9a826' },
]

/** The panel and its sliding track. Anything a panel wants pinned to the tape
 *  rather than to the track — a deviation bar, a waypoint's own marker — goes
 *  in as children, so it stays put while the degrees run past behind it. */
export default function CompassTape({ children }: { children?: ReactNode }) {
  return (
    <div className="tape-panel">
      <div className="tape-track">
        {TICKS.map((t) => (
          <span
            key={`t${t.deg.toFixed(2)}`}
            className={t.major ? 'tape-tick' : 'tape-tick tape-tick--small'}
            style={at(t.deg)}
          />
        ))}
        {DOTS.flatMap((d) =>
          [-360, 0, 360].map((wrap) => (
            <span
              key={`d${d.deg}${wrap}`}
              className="tape-dot"
              style={{ ...at(d.deg + wrap), background: d.tone }}
            />
          )),
        )}
        {NUMBERS.map((d) => (
          <span key={`n${d}`} className="tape-deg" style={at(d)}>
            {((d % 360) + 360) % 360}
          </span>
        ))}
        {CARDINALS.map((c) => (
          <span
            key={`c${c.deg}`}
            className={c.name.length === 1 ? 'tape-point tape-point--main' : 'tape-point'}
            style={at(c.deg)}
          >
            {c.name}
          </span>
        ))}
      </div>
      {children}
    </div>
  )
}
