// app/projects/alpha-hunt/page.tsx
// Every picture is still a `Placeholder`; the label on each one is the brief
// for what goes in its place.
'use client'

import Image from 'next/image'
import { Roboto_Condensed } from 'next/font/google'
import Link from 'next/link'
import CaseNav from '../../case-nav'
import ScrollReveal from '../../scroll-reveal'
import RangeDemo from './range-demo'
import RangingDemo from './ranging-demo'
import AccessDemo from './access-demo'
import LoopClip from '../loop-clip'
import DeviceFlow from './device-flow'
import NavigateDemo from './navigate-demo'
// only the held-back sections still use this; it comes back with them
// import Placeholder from '../placeholder'

// The blue label at the head of each section, and the contents rail docked to
// the left margin, are the same set of words — the rail is an index of what is
// written down the page.
// The one sentence the whole feature is measured against, set on black.
const creed = [
  'Open the tool,',
  'understand your surroundings,',
  'get back to the hunt.',
]

const condensed = Roboto_Condensed({ subsets: ['latin'], weight: ['700'] })

// The three wearables the navigation model was read off, and what each one
// settled. The two Apple screens carry a recording; the Garmin does not.
const REFS = [
  {
    watch: '/projects/alpha-watch-a.png',
    clip: '/projects/alpha-watch-nav.mp4',
    alt: "Apple Watch guiding a walker to a saved location, the ring showing how far off the heading is.",
    title: 'Selecting a waypoint',
    body: 'Apple Watch’s waypoint navigation showed how users could select a saved location and stay aligned with it as they moved.',
  },
  {
    watch: '/projects/alpha-watch-b.png',
    clip: '/projects/alpha-watch-compass.mp4',
    alt: 'Apple Watch compass with saved waypoints held around the dial as it turns.',
    title: 'Waypoints in the compass',
    body: 'Keeping saved waypoints visible along the compass provided continuous spatial context without requiring users to pan across the map.',
  },
  {
    watch: '/projects/alpha-watch-garmin.png',
    clip: null,
    alt: '',
    wide: true,
    title: 'Starting from an existing model',
    body: 'Garmin’s existing location inputs helped define the foundation we could build on.',
  },
]

// In the order the icons were drawn in.
const APPS = [
  { name: 'onX Hunt', src: '/projects/alpha-app-onx.png' },
  { name: 'Spartan Forge', src: '/projects/alpha-app-spartan.png' },
  { name: 'BaseMap', src: '/projects/alpha-app-basemap.png' },
  { name: 'HuntStand', src: '/projects/alpha-app-huntstand.png' },
  { name: 'Apple Compass', src: '/projects/alpha-app-apple.png' },
  { name: 'Garmin Compass', src: '/projects/alpha-app-garmin.png' },
]

const sections = [
  { id: 'context', label: 'CONTEXT' },
  { id: 'problem', label: 'PROBLEM' },
  { id: 'goal', label: 'THE GOAL' },
  { id: 'opportunity', label: 'THE OPPORTUNITY' },
  { id: 'features', label: 'FEATURE HIGHLIGHTS' },
  { id: 'competitive', label: 'COMPETITIVE ANALYSIS' },
  // held back with the section itself
  // { id: 'adaptation', label: 'ADAPTATION' },
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
            Helping Hunters <em>Understand Their Surroundings</em>
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
              {/* The kit the app was built around, and then the three pieces of
                  it drawn as a system, with the work marked on the one this case
                  study is about. */}
              <figure className="case-media">
                <Image
                  src="/projects/alpha-existing-app.jpg"
                  alt="A Garmin Alpha handheld, an orange dog collar with its tracking unit, and a phone running the Alpha app, laid out on grass."
                  width={1579}
                  height={996}
                  sizes="(max-width: 768px) 100vw, 62vw"
                />
                <figcaption className="case-caption">
                  The existing Alpha ecosystem
                </figcaption>
              </figure>
              <DeviceFlow />
            </section>

            <section className="case-section" id="problem">
              <h2 className="case-heading">PROBLEM</h2>
              <p className="case-lead case-lead--wrap">
                Hunters lack a quick, easy way to orient themselves and
                understand what&apos;s around them.
              </p>
            </section>

            <section className="case-section" id="goal">
              <h2 className="case-heading">THE GOAL</h2>
              {/* A bracket stands off each corner, set in from the edge
                  rather than on it, so the frame holds the words without
                  crowding them. */}
              <div className="case-creed">
                {['tl', 'tr', 'br', 'bl'].map((corner) => (
                  <Image
                    key={corner}
                    className={`case-creed-bracket case-creed-bracket--${corner}`}
                    src="/projects/alpha-bracket.png"
                    alt=""
                    width={151}
                    height={151}
                  />
                ))}
                <p className={`case-creed-text ${condensed.className}`}>
                  {creed.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </section>

            <section className="case-section" id="opportunity">
              <h2 className="case-heading">THE OPPORTUNITY</h2>
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
                  <RangingDemo />
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
                  <NavigateDemo />
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
                  <AccessDemo />
                </div>
              </div>
            </section>

            <section className="case-section" id="competitive">
              <h2 className="case-heading">COMPETITIVE ANALYSIS</h2>
              <p className="case-lead case-lead--wrap">
                How do other apps and devices approach compass?
              </p>
              <p className="case-text">
                Our compass tools were informed by competitive benchmarking
                across onX Hunt, Spartan Forge, BaseMap, HuntStand, Apple
                Compass, and Garmin Compass. We used familiar interaction
                patterns to align with users’ existing mental models while
                identifying opportunities to stay competitive in the hunting
                space.
              </p>
              {/* Who was looked at: six icons at one size with their names
                  under them, which is all the survey needs to say. */}
              <figure className="case-media">
                <ul className="case-apps">
                  {APPS.map((app) => (
                    <li key={app.name}>
                      <Image src={app.src} alt="" width={400} height={400} sizes="104px" />
                      <span>{app.name}</span>
                    </li>
                  ))}
                </ul>
                <figcaption className="case-caption">
                  The compasses studied
                </figcaption>
              </figure>

              <p className="case-lead">
                Studying waypoint navigation across devices
              </p>
              <p className="case-text">
                Much of the navigation model was informed by compass and
                waypoint patterns across Apple Watch and Garmin wearables.
                Backtrack was especially useful for understanding how users
                orient toward saved locations, while also highlighting where
                general navigation use cases—like driving or hiking—needed to be
                adapted for hunting-specific scenarios.
              </p>
              {/* Three references side by side. The two Apple screens are
                  live: the recordings are cropped to the glass and rounded to
                  the silhouette, so they sit in the watches rather than on
                  them. The Garmin is as it came. */}
              <ul className="case-refs">
                {REFS.map((ref) => (
                  <li key={ref.title}>
                    <div className="case-ref-watch">
                      <Image
                        src={ref.watch}
                        alt=""
                        width={ref.wide ? 668 : 600}
                        height={989}
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                      {ref.clip && (
                        <LoopClip src={ref.clip} label={ref.alt} className="case-ref-screen" />
                      )}
                    </div>
                    <h3 className="case-ref-title">{ref.title}</h3>
                    <p className="case-ref-text">{ref.body}</p>
                  </li>
                ))}
              </ul>

              {/* Held back for now — the remote-mode comparison:
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
              */}
            </section>

            {/* Held back for now — what still works offline:
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
            */}

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
              {/* The same five tools, before and after. Each sits on its own
                  ground so the pair reads as a comparison rather than a run of
                  screens; the pictures carry their own transparent surrounds, so
                  the colour shows between the phones. */}
              <figure className="case-media">
                <div className="case-swatch case-swatch--before">
                  <Image
                    src="/projects/alpha-ds-before.png"
                    alt="Five tools before the alignment work: exit buttons, action buttons and sheets all handled differently from screen to screen."
                    width={2000}
                    height={829}
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                </div>
                <figcaption className="case-caption">
                  Before: tools with inconsistent UI
                </figcaption>
              </figure>
              <figure className="case-media case-media--tight">
                <div className="case-swatch case-swatch--after">
                  <Image
                    src="/projects/alpha-ds-after.png"
                    alt="The same five tools after the alignment work, sharing one set of exit patterns, action buttons and sheets."
                    width={2000}
                    height={788}
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                </div>
                <figcaption className="case-caption">
                  After: consistent UI
                </figcaption>
              </figure>
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
