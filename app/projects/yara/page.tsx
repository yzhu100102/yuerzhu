// app/projects/yara/page.tsx
// Visual slots are left as empty `case-ph` boxes. The comment above each one is
// the brief for what goes in it.
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import YoutubeEmbed from '../../youtube-embed'
import BriefGraphic from './brief-graphic'
import CraftIcons from './craft-icons'
import DeepDives from './deep-dives'
import FeatureVideo from './feature-video'
import ProblemIcons from './problem-icons'

const sections = [
  { id: 'context', label: 'CONTEXT' },
  { id: 'problem', label: 'THE PROBLEM' },
  { id: 'solution', label: 'THE SOLUTION' },
  { id: 'features', label: 'FEATURES' },
  { id: 'deep-dives', label: 'DEEP DIVES' },
  { id: 'craft', label: 'CRAFT' },
  { id: 'next', label: 'NEXT' },
]

const meta = [
  {
    label: 'THE ROLE',
    values: ['Sole designer', 'UX research', 'CUI design', 'Motion'],
  },
  { label: 'TIMELINE', values: ['13 weeks, Spring 2024'] },
  { label: 'PROGRAMS', values: ['Figma', 'Illustrator', 'After Effects'] },
]

export default function YaraCaseStudy() {
  const [active, setActive] = useState(sections[0].id)

  // Highlight whichever section is sitting in the upper third of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <main className="main">
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
          <h1 className="case-title">Yara, a voice assistant for Yummly.</h1>
          <p className="case-text case-text--hero">
            A conversational interface for cooking, shopping, and meal planning,
            built on Yummly&apos;s existing recipe platform.
          </p>
          <dl className="case-meta">
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

        <YoutubeEmbed id="-bki3-2QaBw" title="Meet Yara: Voice Assistant for Yummly" />


        <div className="case-body">
          {/* Section nav — sticks alongside the content */}
          <aside className="case-nav">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={active === section.id ? 'is-active' : undefined}
              >
                {section.label}
              </a>
            ))}
          </aside>

          <div className="case-content">
            <section className="case-section" id="context">
            <h2 className="case-heading">THE BRIEF</h2>
            <p className="case-lead">
              What can a voice assistant do before, during, and after a meal?
            </p>

            <h2 className="case-heading">CONTEXT</h2>
            <p className="case-text">
              Home cooking is spread across a whole day in fragments — a defrost
              that needed starting in the morning, an ingredient bought last week
              that may or may not still be good, three components finishing at
              three different times. Very little of it happens while standing
              still, looking at a screen.
            </p>
            <BriefGraphic />
            <h2 className="case-heading">YARA&apos;S KINETIC STATES</h2>
            <p className="case-text">
              Yara&apos;s states were designed to be easily distinguishable and
              approachable so that talking to the app in your own kitchen
              doesn&apos;t feel strange.
            </p>
            <div className="cui-states">
            <video
              src="/projects/cui-states.mp4"
              poster="/projects/cui-states-poster.jpg"
              aria-label="Yara&apos;s kinetic states: awake, loading, success, timer, error, alert, speaking, and listening."
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            </div>
            </section>

            <section className="case-section" id="problem">
              <h2 className="case-heading">THE PROBLEM</h2>
              <p className="case-lead">
                Cooking is the worst possible time to use a phone.
              </p>
              <p className="case-text">
                Greasy screens. Displays that time out mid-step. A glance away
                that lasts long enough for something to burn.
              </p>
              <p className="case-text">
                But 24 surveys and 4 interviews turned up a second problem
                underneath that one. Nobody struggled with following an
                instruction. They struggled with instructions running in
                parallel — and with preparation that needed to happen hours
                before anyone turned on a burner.
              </p>
              <p className="case-text">
                Three concerns came up repeatedly: whether an ingredient had
                spoiled, losing track of one dish while attending to another,
                and forgetting to defrost or marinate ahead of time.
              </p>
              <ProblemIcons />
            </section>

            <section className="case-section" id="solution">
              <h2 className="case-heading">THE SOLUTION</h2>
              <p className="case-lead">
                Yara is a voice assistant built into Yummly.
              </p>
              <p className="case-text">
                The goal was to provide help at the right moment rather than
                when it&apos;s asked for.
              </p>
              <FeatureVideo
                label="Yara answering in the moment, built into the Yummly app."
                sources={['/projects/solution.mp4']}
              />

            </section>

            <section className="case-section" id="features">
              <h2 className="case-heading">FEATURES</h2>

              <div className="case-insight">
                <span className="case-insight-number">01</span>
                <div>
                  <h3 className="case-insight-title">
                    Recipes from what&apos;s already in the kitchen
                  </h3>
                  <p className="case-text">
                    Yara suggests recipes based on inventory, past ratings, and
                    current cravings, and flags ingredients running low or
                    nearing expiration.
                  </p>
                  <FeatureVideo
                    label="Yara recommending a recipe from what is in the kitchen, then adding a missing ingredient to the shopping list."
                    sources={[
                      '/projects/feature-recommendation.mp4',
                      '/projects/feature-adding-to-list.mp4',
                    ]}
                  />
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">02</span>
                <div>
                  <h3 className="case-insight-title">
                    Timing handled in advance and in the moment
                  </h3>
                  <p className="case-text">
                    Timers are set from the recipe rather than by request.
                    Pre-cooking steps — defrosting, marinating, picking up an
                    ingredient — surface hours or days ahead, pulled from the
                    Yummly meal plan.
                  </p>
                  <FeatureVideo
                    label="Yara reminding the cook to defrost an ingredient ahead of the meal."
                    sources={['/projects/feature-defrost.mp4']}
                  />
                </div>
              </div>

              <div className="case-insight">
                <span className="case-insight-number">03</span>
                <div>
                  <h3 className="case-insight-title">Adjustments mid-cook</h3>
                  <p className="case-text">
                    Recipes adapt to dietary preferences, which persist for next
                    time. Yara converts measurements, pulls up technique videos,
                    troubleshoots problems like food sticking, and adjusts
                    connected appliances directly.
                  </p>
                  <FeatureVideo
                    label="Yara troubleshooting a problem partway through cooking."
                    sources={['/projects/feature-troubleshooting.mp4']}
                  />
                </div>
              </div>
            </section>

            <section className="case-section" id="deep-dives">
              <h2 className="case-heading">DEEP DIVES</h2>
              <p className="case-lead">
                You&apos;re just looking at a snippet of the design process.
              </p>
              <DeepDives />
            </section>

            <section className="case-section" id="craft">
              <h2 className="case-heading">CRAFT</h2>
              <p className="case-lead">
                The states had to read at notification size.
              </p>
              <p className="case-text">
                Legible small, distinguishable from each other, and recognizably
                Yummly. The final form came from a carrot — orange, hand-drawn,
                consistent with the existing illustration style.
              </p>
              <p className="case-text">
                Sketched in Figma, drawn in Illustrator, animated in After
                Effects.
              </p>
              <CraftIcons />
            </section>

            <section className="case-section" id="next">
              <h2 className="case-heading">NEXT</h2>
              <p className="case-text">
                The whole system assumes groceries get scanned. That&apos;s the
                riskiest assumption in it, and the first thing worth testing —
                likely against receipt scanning or a photo of an open fridge,
                either of which asks less of the person.
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
