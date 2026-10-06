// Approach S72, putt reading.
//
// Built to the same shape as the other case studies: the hero and its meta
// block, then the rail beside a column of sections. Every picture is still a
// `Placeholder` carrying the brief for what belongs in it, so the page reads as
// a plan rather than a column of blank rectangles.
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Roboto } from 'next/font/google'
import type { CSSProperties } from 'react'
import CaseNav from '../../case-nav'
import ScrollReveal from '../../scroll-reveal'
// only the held-back section still uses this; it comes back with it
// import Placeholder from '../placeholder'
import LoopClip from '../loop-clip'
import FilmLoop from '../film-loop'

// The one question the work is measured against, set over the still.
const asking = Roboto({ subsets: ['latin'], weight: ['500'], style: ['italic'] })

// The three-step flow is the widest of the set, so it sets the height they all
// share; the others take their own proportion of the same width. Read off the
// crops: 4.472 : 3.905 : 2.390 wide to one tall.
const STEP_PIN = { '--flow': '100%' } as CSSProperties
const STEP_GREEN = { '--flow': '87.32%' } as CSSProperties
const STEP_PAIR = { '--flow': '53.44%' } as CSSProperties

const sections = [
  { id: 'context', label: 'CONTEXT' },
  { id: 'need', label: 'THE NEED' },
  { id: 'goal', label: 'THE GOAL' },
  { id: 'opportunity', label: 'THE OPPORTUNITY' },
  { id: 'features', label: 'FEATURE HIGHLIGHTS' },
  { id: 'questions', label: 'DESIGN QUESTIONS' },
  { id: 'troubleshooting', label: 'TROUBLESHOOTING' },
  { id: 'design-system', label: 'DESIGN SYSTEM' },
  { id: 'results', label: 'RESULTS' },
]

const meta = [
  {
    label: 'TEAM',
    values: [
      '1 UX Designer (me)',
      '2 UI Designers',
      '1 Product Manager',
      '2 Engineer Teams',
    ],
  },
  {
    label: 'MY ROLE',
    values: ['UX Strategy', 'Interaction Design', 'Prototyping'],
  },
  { label: 'TIMELINE', values: ['December 2025', 'Launching Q3 2026'] },
  { label: 'PROGRAM', values: ['Figma'] },
]

export default function S72CaseStudy() {
  return (
    <main className="main">
      <ScrollReveal step={0.045} restoreKey="case-scroll:s72" />
      {/* Nav */}
      <nav className="nav">
        <Link href="/" className="nav-name">YUER ZHU</Link>
        <div className="nav-links">
          <Link href="/" className="is-active">WORK</Link>
          <Link href="/play">PLAY</Link>
          <Link href="/about">ABOUT</Link>
        </div>
      </nav>

      <article className="case">
        <header className="case-hero">
          <p className="case-kicker">GARMIN APPROACH S72 GOLF WATCH</p>
          <h1 className="case-title">
            Golf Data <em>at a Glance</em>
          </h1>
          <p className="case-text">
            A putt-reading experience for Garmin Approach S72 golf watch that
            helps golfers understand how a green slopes and which direction a
            putt is likely to break.
          </p>
          <p className="case-text">
            Garmin golf watches already showed green contours through
            color-coded map data, but interpreting that information still
            required the golfer to read the map themselves. This new
            putt-reading feature for the upcoming Approach S72 golf watch
            translates that contour data into a more direct callout of slope
            data from a specific location on the green.
          </p>
          <p className="case-text case-text--hero">
            This project involved working with existing golf workflows, hardware
            controls, and imperfect GPS and compass data.
          </p>
          <dl className="case-meta case-meta--four">
            {meta.map((row) => (
              <div className="case-meta-row" key={row.label}>
                <dt>{row.label}</dt>
                {row.values.map((value) => (
                  <dd key={value}>{value}</dd>
                ))}
              </div>
            ))}
          </dl>
        </header>

        <div className="case-body">
          <CaseNav sections={sections} />

          <div className="case-content">
            <section className="case-section" id="context">
              {/* The film opens the section, ahead of its own heading: the
                  stretches that show the feature, played one after another
                  and then round again. The heading then sits with the copy it
                  belongs to rather than away from it above the film. */}
              <FilmLoop
                film="RH3AC3ttKZ0"
                cuts={[
                  { from: 12, to: 16 },
                  { from: 29, to: 35 },
                  { from: 41, to: 46 },
                  { from: 53, to: 63 },
                ]}
                label="Garmin's Approach golf watch film: aerial course imagery on the watch face, then its Back and Start/Stop buttons"
              />
              <h2 className="case-heading">CONTEXT</h2>
              <p className="case-lead case-lead--wrap">Building from the S70</p>
              <p className="case-text">
                The S70 served as the foundation for the next-generation
                experience. We carried forward familiar functionality and
                patterns, reworked the UI, improved usability, and made room for
                new features.
              </p>
            </section>

            <section className="case-section" id="need">
              <h2 className="case-heading">THE NEED</h2>
              <p className="case-lead case-lead--wrap">
                Golfers want to understand the slope of the green when
                practicing putts on the green.
              </p>
              <p className="case-text">
                The putt reading experience needed to quickly answer two things:
              </p>
              <ol className="case-list">
                <li>Which direction the green breaks (Left, Right, Downhill, Uphill)</li>
                <li>How severe the slope is (by %)</li>
              </ol>
              <p className="case-text">
                This is data reflected from the location of where the terrain
                changes between the ball and the hole. The challenge was fitting
                that into an existing watch flow without creating unnecessary
                steps.
              </p>
              {/* The reading itself, beside the same watch in play. */}
              <figure className="case-media">
                <div className="case-media-row case-media-row--s72">
                  <Image
                    src="/projects/s72-reading-wrist.jpg"
                    alt="The watch on a golfer's wrist on the green, reading 6ft, 1.0% R and 1.5% D over a contour map of the green."
                    width={700}
                    height={830}
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                  <Image
                    src="/projects/s72-reading-play.jpg"
                    alt="A golfer at address with the watch on their wrist, the green behind them."
                    width={1600}
                    height={737}
                    sizes="(max-width: 768px) 100vw, 52vw"
                  />
                </div>
                <figcaption className="case-caption">
                  The reading on the green
                </figcaption>
              </figure>
            </section>

            <section className="case-section case-section--pair" id="goal">
              <h2 className="case-heading">THE GOAL</h2>
              <p className="case-lead case-lead--wrap">
                Providing golfers a quick way to get slope data based on where
                they tell us they want to see it.
              </p>
              <p className="case-text">
                Early conversations focused on what the watch could reliably
                communicate. Some golfers practice Aim Point, the specific spot
                on the ground or target line where a player intends to direct
                their shot or start a putt.
              </p>
              <p className="case-text">
                Because the data was not accurate enough to recommend an exact
                aim point, we moved away from telling golfers where to aim and
                focused instead on slope direction and percentage.
              </p>
            </section>

            <section className="case-section" id="opportunity">
              <h2 className="case-heading">THE OPPORTUNITY</h2>
              {/* The question itself, laid over the still rather than set above
                  it — so the still is a ground for it, not a picture of its
                  own. The words stay real text. */}
              <div className="case-hmw">
                <Image
                  src="/projects/s72-hmw.png"
                  alt=""
                  width={2000}
                  height={978}
                  sizes="(max-width: 768px) 100vw, 74vw"
                />
                <p className={`case-hmw-question ${asking.className}`}>
                  <span>How might we help golfers quickly</span>
                  <span>understand the green without disrupting</span>
                  <span>their putting routine?</span>
                </p>
                {/* The render sits under the question, standing off the bottom
                    edge by what the lockup stands off the top. Both grounds are
                    the same black, so the clip has no edge of its own. */}
                <LoopClip
                  className="case-hmw-render"
                  src="/projects/s72-render.mp4"
                  label="A wireframe render of the Approach S70 turning against black."
                />
              </div>
            </section>

            <section className="case-section" id="features">
              <h2 className="case-heading">FEATURE HIGHLIGHTS</h2>

              <div className="case-insight">
                <span className="case-insight-number">01</span>
                <div>
                  <h3 className="case-insight-title">First, mark the pin.</h3>
                  <p className="case-text">
                    On the FMB page, the familiar distance experience becomes
                    the entry point. As the golfer reaches the green, the screen
                    simplifies around distance to the pin, and pressing the Back
                    button is used to mark the flag and access putt reading.
                  </p>
                  <p className="case-text">
                    Building on Garmin&apos;s existing Mark Pin interaction, we
                    treated putt reading as an extension of that. If the watch
                    already knew where the hole and golfer were, those inputs
                    could also support a slope reading. This kept the concept
                    grounded in an existing workflow.
                  </p>
                  <p className="case-text">
                    The first design question was whether this feature should be
                    tied in with Mark Putt: do users want to see the slope after
                    they&apos;ve marked the putt, ie. made a shot? Is that data
                    useful or just cluttering the screen?
                  </p>
                  {/* NOTE: alt left empty deliberately — see the note in 02. */}
                  <figure className="case-media case-media--insight">
                    <Image
                      src="/projects/s72-shot-pin.jpg"
                      alt=""
                      width={1562}
                      height={1007}
                      sizes="(max-width: 768px) 100vw, 74vw"
                    />
                  </figure>
                  {/* Read left to right: onto the green, Back to mark the pin,
                      and the slope comes back on its own. Held well in from the
                      column's edges so the watches stay small enough to read as
                      a flow rather than as three pictures. */}
                  <figure className="case-media case-flow-shot" style={STEP_PIN}>
                    <Image
                      src="/projects/s72-step-pin.png"
                      alt="Three watch screens in a row: distance to the pin on the green, a Pin Marked confirmation after pressing Back, and the slope reading that follows automatically."
                      width={2100}
                      height={470}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </figure>
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">02</span>
                <div>
                  <h3 className="case-insight-title">
                    After making a putt, mark it.
                  </h3>
                  <p className="case-text">
                    Part of the challenge was working with what we had already
                    implemented, which was the ability to mark a putt. To still
                    allow this functionality, we repurposed the Back button to
                    change from marking the pin to marking a putt after we know
                    the pin&apos;s location.
                  </p>
                  <p className="case-text">
                    Another part of this challenge was working with CT10s,
                    Garmin&apos;s automatic golf club tracking device that
                    screws into the butt end of your golf grip to record every
                    shot you take. Supporting both manual inputs and automatic
                    detections of the putt was part of the challenge.
                  </p>
                  {/* NOTE: alt left empty for now. The flow directly beneath
                      each of these describes the same moment screen by screen,
                      so an empty alt is right for a picture that would only
                      repeat it — but if these stills show something the flow
                      does not, they want real alt text. */}
                  <figure className="case-media case-media--insight">
                    <Image
                      src="/projects/s72-shot-putt.jpg"
                      alt=""
                      width={2200}
                      height={1418}
                      sizes="(max-width: 768px) 100vw, 74vw"
                    />
                  </figure>
                  <figure className="case-media case-flow-shot" style={STEP_PAIR}>
                    <Image
                      src="/projects/s72-step-putt.png"
                      alt="Two watch screens: the slope reading, then a Putt Marked confirmation after pressing Back again."
                      width={1200}
                      height={502}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </figure>
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">03</span>
                <div>
                  <h3 className="case-insight-title">
                    Read the green as you move
                  </h3>
                  <p className="case-text">
                    Putt Reading updates with the golfer&apos;s current
                    location, giving them a live read of slope as they move
                    around the green.
                  </p>
                  <figure className="case-media case-flow-shot" style={STEP_PAIR}>
                    <Image
                      src="/projects/s72-step-dynamic.png"
                      alt="Two watch screens: the slope reading at one spot, and the updated reading after the golfer moves."
                      width={1200}
                      height={502}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </figure>
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">04</span>
                <div>
                  <h3 className="case-insight-title">
                    Read from a fixed location
                  </h3>
                  <p className="case-text">
                    On Green View, golfers can manually set their location or
                    the flag to get a reading from a specific point. This also
                    provides a fallback when GPS appears inaccurate.
                  </p>
                  <figure className="case-media case-flow-shot" style={STEP_GREEN}>
                    <Image
                      src="/projects/s72-step-greenview.png"
                      alt="Five watch screens: tapping the map opens Green View, where the location or flag can be moved to read the slope from a chosen point."
                      width={1800}
                      height={461}
                      sizes="(max-width: 768px) 100vw, 68vw"
                    />
                  </figure>
                </div>
              </div>
            </section>

            <section className="case-section" id="questions">
              <h2 className="case-heading">DESIGN QUESTIONS</h2>

              <p className="case-lead case-lead--wrap">One reading or many?</p>
              <p className="case-text">
                A green does not slope uniformly, so a single percentage can
                oversimplify what is happening between the ball and the hole. I
                explored single averages, multiple readings along the putt line,
                and directional indicators showing where slope changed.
              </p>
              <p className="case-text">
                More detail gave golfers more context, but also required more
                interpretation. The design challenge became deciding how much
                information was actually useful on a small screen, in the middle
                of play.
              </p>
              {/* Carries its own ground and its own labels, so it runs the
                  column's full width rather than being held in. */}
              <figure className="case-media">
                <Image
                  src="/projects/s72-readings-pad.png"
                  alt="Watch screens compared: one reading for the whole line, readings for each third, and a details page reached by tapping a bubble."
                  width={2100}
                  height={1015}
                  sizes="(max-width: 768px) 100vw, 74vw"
                />
              </figure>

              {/* Held back for now — fixed against dynamic:
              <p className="case-lead">Fixed or dynamic?</p>
              <p className="case-text">
                Another key question was whether the reading should stay tied to
                one marked location or update as the golfer moved.
              </p>
              <p className="case-text">
                A fixed reading was clear and specific, but required the golfer
                to mark a new position each time. A dynamic reading was the
                ideal since it made it easier to walk around the green and
                inspect different areas, but with that we had to rely on GPS
                accuracy. I explored both models, and we ended up with a hybrid
                approach to allow both.
              </p>
              <div className="case-grid-3">
                <Placeholder label="Fixed reading" ratio="4 / 5" />
                <Placeholder label="Dynamic reading" ratio="4 / 5" />
                <Placeholder label="Hybrid" ratio="4 / 5" />
              </div>
              */}

              <p className="case-lead">Screen, button, or menu?</p>
              <p className="case-text">
                We explored three ways to access Mark Pin: a physical button
                press, an on-screen control, or an option within the menu.
              </p>
              <p className="case-text">
                Beta feedback favored hardware input because golfers could mark
                the pin without looking closely at the watch, while on-screen
                and menu-based options added more visual or interaction
                overhead. That pushed the final direction toward preserving the
                faster button-driven flow where possible.
              </p>
              <figure className="case-media">
                <Image
                  src="/projects/s72-access-pad.png"
                  alt="Three watch screens compared: an on-screen Mark Pin button, the same screen marked by pressing Back, and Mark Pin as an option in the menu."
                  width={2100}
                  height={1015}
                  sizes="(max-width: 768px) 100vw, 74vw"
                />
              </figure>
            </section>

            <section className="case-section" id="troubleshooting">
              <h2 className="case-heading">TROUBLESHOOTING</h2>
              <p className="case-lead case-lead--wrap">
                Designing for GPS and compass uncertainty
              </p>
              <p className="case-text">
                Later in the project, GPS and compass accuracy became the
                biggest constraint. GPS could be off by several yards, which is
                significant when interpreting a putt measured in feet. The
                golfer&apos;s position, the pin location, and the map
                orientation could all be wrong, and the system could not always
                detect when that happened.
              </p>
              <p className="case-text">
                At that point, the design problem shifted from simply showing a
                reading to deciding how much trust to place in imperfect sensor
                data. The final direction kept the default flow fast, but added
                manual correction when the system was wrong.
              </p>
              <figure className="case-media">
                <Image
                  src="/projects/s72-gps-pad.png"
                  alt="Three watch screens compared: a radius accuracy indicator added to the existing UI, a projected line with no pin mark, and a manually entered putt reading."
                  width={2100}
                  height={1015}
                  sizes="(max-width: 768px) 100vw, 74vw"
                />
              </figure>
            </section>

            <section className="case-section" id="design-system">
              <h2 className="case-heading">DESIGN SYSTEM</h2>
              <p className="case-text">
                We worked closely with 2 UI designers who were in charge of
                keeping the style in line with our other watch lines.
              </p>
              {/* The two boards stacked rather than set side by side, since
                  each is dense enough to want the whole column. */}
              <figure className="case-media case-board">
                <Image
                  src="/projects/s72-system-1.png"
                  alt="A board of the watch design system's components: screen and device, backgrounds, headers, button hints, banners, toasts, spinners, progress and logging."
                  width={2100}
                  height={1292}
                  sizes="(max-width: 768px) 100vw, 68vw"
                />
              </figure>
              <figure className="case-media case-board case-media--tight">
                <Image
                  src="/projects/s72-system-2.png"
                  alt="A second board of the design system: menu and glance lists, notifications, pin lock, pull tab, and the widget pages and graphs."
                  width={2100}
                  height={1397}
                  sizes="(max-width: 768px) 100vw, 68vw"
                />
              </figure>
            </section>

            <section className="case-section" id="results">
              <h2 className="case-heading">RESULTS</h2>
              <p className="case-lead">Design for the imperfect state</p>
              <p className="case-text">
                The biggest lesson from this project was that a feature is not
                only defined by its ideal interaction; it also depends on how
                well it handles uncertainty, hardware limits, and existing user
                habits.
              </p>
              <p className="case-lead">Testing with real putting scenarios</p>
              <p className="case-text">
                The next phase would focus on validating the interaction in real
                putting scenarios, especially how quickly golfers understand the
                reading, how often they need to correct location, and whether
                those recovery paths remain lightweight during a round.
              </p>
              <p className="case-text">
                Further work would also include refining GPS and compass
                confidence thresholds, calibration behavior, and how the
                experience could scale across Garmin&apos;s other vector-map
                golf products.
              </p>
              <p className="case-next">
                <Link href="/">← BACK TO ALL WORK</Link>
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  )
}
