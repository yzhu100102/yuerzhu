// app/projects/alpha-hunt/page.tsx
// Every picture is still a `Placeholder`; the label on each one is the brief
// for what goes in its place.
'use client'

import Image from 'next/image'
import Link from 'next/link'
import CaseNav from '../../case-nav'
import ScrollReveal from '../../scroll-reveal'
import PhraseWheel from './phrase-wheel'
import RangeDemo from './range-demo'
import Placeholder from './placeholder'

// The blue label at the head of each section, and the contents rail docked to
// the left margin, are the same set of words — the rail is an index of what is
// written down the page.
const sections = [
  { id: 'context', label: 'CONTEXT' },
  { id: 'problem', label: 'PROBLEM' },
  { id: 'opportunity', label: 'THE OPPORTUNITY' },
  { id: 'features', label: 'FEATURE HIGHLIGHTS' },
  { id: 'competitive', label: 'COMPETITIVE ANALYSIS' },
  { id: 'adaptation', label: 'ADAPTATION' },
  { id: 'design-system', label: 'DESIGN SYSTEM' },
  { id: 'results', label: 'RESULTS' },
]

const meta = [
  {
    label: 'TEAM',
    values: [
      '4 Designers',
      '1 Product Manager',
      '2 Engineer Teams',
      '1 Map Engine Team',
    ],
  },
  {
    label: 'MY ROLE',
    values: ['Product Designer', 'UX', 'Research', 'Strategy'],
  },
  { label: 'TIMELINE', values: ['June 2024', 'Launching Q3 2027', 'In progress'] },
  { label: 'PROGRAM', values: ['Figma'] },
]

export default function AlphaHuntCaseStudy() {
  return (
    <main className="main">
      <ScrollReveal step={0.045} restoreKey="case-scroll:alpha-hunt" />
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
          <p className="case-kicker">GARMIN ALPHA HUNT APP</p>
          <h1 className="case-title">
            Helping hunters <em>understand their surroundings</em>
          </h1>
          <p className="case-text case-text--hero">
            A new compass, ranging, and navigation tool for Garmin&apos;s Alpha
            Hunt app. The work focused on helping hunters quickly understand
            distance, direction, and what&apos;s around them, both in the field
            and while planning from saved locations.
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

        {/* The picture the study opens on: the tool in the field, and the
            same reading on the phone beside it. */}
        <div className="case-hero-image">
          <Image
            src="/projects/alpha-hunt-hero.jpg"
            alt="A hunter standing with a dog on a ridge, phone in hand, with the app's ranging read-out drawn over the scene and shown again on the screen beside it."
            width={1536}
            height={870}
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        </div>

        <div className="case-body">
          <CaseNav sections={sections} />

          <div className="case-content">
            <section className="case-section" id="context">
              <h2 className="case-heading">CONTEXT</h2>
              <p className="case-lead case-lead--wrap">
                Evolving the Alpha ecosystem, by starting with the app.
              </p>
              <p className="case-text">
                Garmin Alpha was originally built around hunters who use
                tracking dogs. Paired with Garmin&apos;s LTE and VHF tracking
                devices, the app helps hunters follow dogs in the field, view
                their movements on a map, mark waypoints, navigate to saved
                locations, and coordinate with other members of a hunting party.
              </p>
              <p className="case-text">But not every hunter hunts with dogs.</p>
              <p className="case-text">
                As Alpha expanded, we began looking at the app as more than a
                companion for dog tracking. There was an opportunity to support
                a wider range of hunters with tools they could use before and
                during a hunt — whether or not a dog was part of it. The work in
                this case study focuses on new features brought into the app.
              </p>
              {/* The kit the app was built around, and the handheld itself.
                  The two columns are weighted by each picture's own proportions
                  so the pair stands at one height without either being cropped. */}
              <figure className="case-media">
                <div className="case-media-row">
                  <Image
                    src="/projects/alpha-existing-app.jpg"
                    alt="A Garmin Alpha handheld, an orange dog collar with its tracking unit, and a phone running the Alpha app, laid out on grass."
                    width={1579}
                    height={996}
                    sizes="(max-width: 768px) 100vw, 38vw"
                  />
                  <Image
                    src="/projects/alpha-device-detail.jpg"
                    alt="A close view of the Alpha handheld: its buttons, antenna, and the topographic map on its screen."
                    width={1978}
                    height={1972}
                    sizes="(max-width: 768px) 100vw, 24vw"
                  />
                </div>
                <figcaption className="case-caption">
                  The existing Alpha app
                </figcaption>
              </figure>
            </section>

            <section className="case-section" id="problem">
              <h2 className="case-heading">PROBLEM</h2>
              <p className="case-lead case-lead--wrap">
                Hunters lack a quick, easy way to orient themselves and
                understand what&apos;s around them.
              </p>
            </section>

            <section className="case-section" id="opportunity">
              <h2 className="case-heading">THE OPPORTUNITY</h2>
              <PhraseWheel />
              <p className="case-lead case-lead--wrap">
                How might we give hunters immediate distance and direction
                information so they can better understand the environment around
                them?
              </p>
              <p className="case-text">
                This became the anchor for the work that followed. Instead of
                designing several disconnected utilities, I began looking at
                ranging, compass behavior, navigation, and reference points as
                different expressions of the same underlying need:
              </p>
              <p className="case-lead">
                Help hunters orient themselves in the field.
              </p>
            </section>

            <section className="case-section" id="features">
              <h2 className="case-heading">FEATURE HIGHLIGHTS</h2>

              <div className="case-insight">
                <span className="case-insight-number">01</span>
                <div>
                  <p className="case-insight-kicker">COMPASS LOCK</p>
                  <h3 className="case-insight-title">
                    Orient without having to move
                  </h3>
                  <p className="case-text">
                    The compass needed to work in two ways: respond naturally as
                    hunters physically turned, and still let them explore
                    directions when they couldn&apos;t easily move themselves.
                  </p>
                  <p className="case-text">
                    Compass Lock gives hunters manual control of the compass,
                    allowing them to rotate the map and inspect different
                    directions while staying physically still — for example,
                    when hanging in a tree stand with limited mobility.
                  </p>
                  <RangeDemo />
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">02</span>
                <div>
                  <p className="case-insight-kicker">RANGE</p>
                  <h3 className="case-insight-title">
                    Zoom to an object, slide to get a distance, save as a
                    waypoint.
                  </h3>
                  <p className="case-text">
                    Because the interaction may happen while watching an animal
                    or scanning terrain, the design minimizes the amount of user
                    interaction.
                  </p>
                  <Placeholder label="Ranging" />
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">03</span>
                <div>
                  <p className="case-insight-kicker">NAVIGATE</p>
                  <h3 className="case-insight-title">
                    Make sure I&apos;m on track
                  </h3>
                  <p className="case-text">
                    Saved locations are easier to navigate when hunters can
                    quickly see their direction and angle of deviation. They can
                    move around obstacles, then check back in at any point to
                    make sure they&apos;re still on track.
                  </p>
                  <Placeholder label="Reference point" />
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">04</span>
                <div>
                  <p className="case-insight-kicker">ADDITIONAL ACCESS POINTS</p>
                  <h3 className="case-insight-title">
                    Use this tool from any waypoint
                  </h3>
                  <p className="case-text">
                    The same distance and direction tools can be accessed from a
                    saved waypoint, letting hunters explore an area before they
                    arrive. Instead of needing to stand in that location, they
                    can use the map to understand what&apos;s around the waypoint
                    while planning their route or hunt.
                  </p>
                  <Placeholder label="The tool opened from a saved waypoint" />
                </div>
              </div>
            </section>

            <section className="case-section" id="competitive">
              <h2 className="case-heading">COMPETITIVE ANALYSIS</h2>
              <p className="case-lead case-lead--wrap">
                How do other apps and devices approach compass?
              </p>
              <p className="case-text">
                Researching how similar navigation tools worked across Garmin
                devices and competitive hunting apps helped define the core
                behaviors this experience needed to support. It also surfaced
                familiar patterns we could build on, gaps we could avoid, and
                new ideas that shaped the direction of the feature.
              </p>
              <Placeholder
                label="The compasses studied"
                items={[
                  'Apple compass (app and watch)',
                  'Hunt app compasses',
                  'Garmin watch',
                ]}
              />

              <p className="case-lead">How can we be better?</p>
              <p className="case-text">
                OnX Hunt&apos;s compass experience is tied to the hunter&apos;s
                physical location. Looking at the waypoint data hunters already
                save in Alpha opened up a broader opportunity: what if the same
                directional tools could also be used from a place they&apos;re
                planning to go?
              </p>
              <p className="case-text">
                That led to exploring a remote mode, where hunters could select
                a saved waypoint and understand distance and direction from that
                location before ever arriving there.
              </p>
              <div className="case-grid-2">
                <Placeholder
                  label="OnX — limited to where you're standing"
                  ratio="4 / 5"
                />
                <Placeholder
                  label="Ours — choose from a list of saved items and use the tool remotely, anywhere"
                  ratio="4 / 5"
                />
              </div>
            </section>

            <section className="case-section" id="adaptation">
              <h2 className="case-heading">ADAPTATION</h2>
              <p className="case-lead">Mitigations when offline</p>
              <p className="case-text">
                Many hunting environments come with poor or nonexistent
                connectivity. That meant the core directional experience
                couldn&apos;t assume the hunter always had access to online data
                or a fully loaded map.
              </p>
              <p className="case-text">
                We considered which information came from the phone&apos;s
                sensors, which depended on Garmin&apos;s map infrastructure, and
                what would remain useful when connectivity disappeared.
              </p>
              <div className="case-grid-2">
                <Placeholder
                  label="What still works offline"
                  items={[
                    'Using the tool from a waypoint is still doable',
                    'We don’t know where you are, so the compass would be useless',
                  ]}
                  ratio="4 / 5"
                />
                <Placeholder label="The offline state in the app" ratio="4 / 5" />
              </div>
            </section>

            <section className="case-section" id="design-system">
              <h2 className="case-heading">DESIGN SYSTEM</h2>
              <p className="case-lead">Standardizing the experience</p>
              <p className="case-text">
                As multiple designers developed different tools in parallel,
                shared interactions like exit patterns, action buttons, and
                sheets began to diverge. An ongoing effort is bringing those
                patterns back into alignment so the tools feel like one
                connected experience rather than a collection of separate
                features.
              </p>
              <p className="case-text">
                Garmin&apos;s design system provides the foundation for
                typography, spacing, components, states, and hierarchy, but not
                every existing pattern fits this new context. Part of the work is
                defining where consistency should be preserved and where the
                experience needs to intentionally break from the system to
                better support in-field use.
              </p>
              <div className="case-grid-2">
                <Placeholder label="Before: tools with inconsistent UI" ratio="4 / 5" />
                <Placeholder label="After: consistent UI" ratio="4 / 5" />
              </div>
            </section>

            <section className="case-section" id="results">
              <h2 className="case-heading">RESULTS</h2>
              <p className="case-lead">Takeaway</p>
              <p className="case-text">
                Thinking through the different moments a hunter might need this
                tool led me to create multiple access points that meet them
                where they already are in the experience, not just inside the
                toolbox.
              </p>
              <p className="case-lead">Next steps</p>
              <p className="case-text">
                The next phase is focused on refining the interaction model
                across tools, validating how hunters use these features in real
                conditions, and standardizing shared UI patterns across the
                experience.
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
