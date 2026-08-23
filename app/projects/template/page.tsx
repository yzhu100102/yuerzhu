// app/projects/template/page.tsx
// Copy this folder to add a case study, then swap the copy and drop images in
// place of the grey `case-ph` boxes.
'use client'

import Link from 'next/link'
import CaseNav from '../../case-nav'
import ScrollReveal from '../../scroll-reveal'

const sections = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'context', label: 'CONTEXT' },
  { id: 'insights', label: 'INSIGHTS' },
  { id: 'problem', label: 'THE PROBLEM' },
  { id: 'solution', label: 'SOLUTION' },
  { id: 'outcome', label: 'THE OUTCOME' },
]

const meta = [
  { label: 'TIMELINE', value: 'X WEEK SPRINT' },
  { label: 'ROLE', value: 'PRODUCT DESIGNER' },
  { label: 'TEAM', value: 'NAME, NAME, NAME' },
  { label: 'TOOLS', value: 'FIGMA, PROTOPIE' },
]

const insights = [
  'FIRST INSIGHT GOES HERE',
  'SECOND INSIGHT GOES HERE',
  'THIRD INSIGHT GOES HERE',
]

export default function ProjectTemplate() {
  return (
    <main className="main">
      <ScrollReveal />
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
          <h1 className="case-title">PROJECT TITLE @COMPANY</h1>
          <p className="case-question">
            HOW MIGHT WE — THE GUIDING QUESTION FOR THE PROJECT?
          </p>
          <dl className="case-meta">
            {meta.map((row) => (
              <div className="case-meta-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="case-ph case-ph-hero" />

        <div className="case-body">
          <CaseNav sections={sections} />

          <div className="case-content">
            <section className="case-section" id="overview">
              <h2 className="case-heading">OVERVIEW</h2>
              <p className="case-text">
                One or two sentences on what the project was and what shipped.
                Placeholder copy — replace with the real overview.
              </p>
              <div className="case-ph" style={{ aspectRatio: '16 / 9' }} />
            </section>

            <section className="case-section" id="context">
              <h2 className="case-heading">CONTEXT</h2>
              <p className="case-text">
                Background on the product, the users, and the moment this work
                happened in. Placeholder copy.
              </p>
              <div className="case-grid-2">
                <div className="case-ph" style={{ aspectRatio: '4 / 3' }} />
                <div className="case-ph" style={{ aspectRatio: '4 / 3' }} />
              </div>
              <p className="case-caption">CAPTION FOR THE IMAGES ABOVE</p>
            </section>

            <section className="case-section" id="insights">
              <h2 className="case-heading">INSIGHTS</h2>
              <div className="case-insights">
                {insights.map((insight, i) => (
                  <div className="case-insight" key={insight}>
                    <span className="case-insight-number">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="case-insight-title">{insight}</h3>
                      <p className="case-text">
                        A sentence of supporting evidence — what you saw in
                        research that led here.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="case-section" id="problem">
              <h2 className="case-heading">THE PROBLEM</h2>
              <p className="case-text">
                The sharpened problem statement the rest of the work answers.
                Placeholder copy.
              </p>
              <div className="case-ph" style={{ aspectRatio: '16 / 9' }} />
            </section>

            <section className="case-section" id="solution">
              <h2 className="case-heading">SOLUTION</h2>
              <p className="case-text">
                Introduce the solution in a line, then walk through the key
                moments of the experience.
              </p>
              <div className="case-ph" style={{ aspectRatio: '16 / 10' }} />
              <p className="case-caption">FEATURE ONE</p>
              <div className="case-grid-2">
                <div className="case-ph" style={{ aspectRatio: '3 / 4' }} />
                <div className="case-ph" style={{ aspectRatio: '3 / 4' }} />
              </div>
              <p className="case-caption">FEATURE TWO + THREE</p>
            </section>

            <section className="case-section" id="outcome">
              <h2 className="case-heading">THE OUTCOME</h2>
              <p className="case-text">
                What happened after — metrics, launch, what you would do next.
              </p>
              <div className="case-ph" style={{ aspectRatio: '16 / 9' }} />
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
