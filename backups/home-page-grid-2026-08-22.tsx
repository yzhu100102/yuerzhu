// app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import ProjectMedia from './project-media'
import ScrollReveal from './scroll-reveal'
import { CMU, GARMIN, RED_HOUSE } from './links'

type Project = {
  id: number
  title: string
  /** Meta line under the title, e.g. "Garmin • Product Design • Wearable". */
  subheader?: string
  description?: string
  image: string
  /** Looping video thumbnail. Takes precedence over `image` when present. */
  video?: string
  /** Still shown until the video paints, and whenever it cannot autoplay. */
  poster?: string
  /** CSS background for the card frame. Also switches the video to multiply
   *  blending, so footage mastered on white sits on the tint. */
  background?: string
  /** Typed out over a white card at the end of the video loop. */
  endTitle?: string
  href: string
  /**
   * The thumbnail's intrinsic pixel size. The card's frame is set to this exact
   * ratio, so portrait and landscape thumbnails sit side by side in the grid and
   * neither one gets cropped. Placeholder cards use a nominal ratio.
   */
  width: number
  height: number
}

/**
 * Yummly's palette, sampled from the animation itself: indigo #2D288F,
 * cream #FFF6DC, orange #F98B5A, green #007B61 — laid in as wide, faint washes
 * so the frame reads as a tint and the artwork stays the loudest thing on it.
 */
const YUMMLY_TINT = [
  'radial-gradient(120% 95% at 10% 5%, rgba(249, 139, 90, 0.20) 0%, rgba(249, 139, 90, 0) 58%)',
  'radial-gradient(105% 90% at 90% 95%, rgba(45, 40, 143, 0.13) 0%, rgba(45, 40, 143, 0) 60%)',
  'radial-gradient(85% 75% at 80% 10%, rgba(0, 123, 97, 0.07) 0%, rgba(0, 123, 97, 0) 62%)',
  'linear-gradient(160deg, #fffdf8 0%, #fff7ea 100%)',
].join(', ')

const projects: Project[] = [
  {
    id: 1,
    title: "Alpha Hunt App",
    subheader: "Garmin • Product Design • App",
    image: "/projects/alpha-hunt-v3.jpg",
    href: "/projects/template",
    width: 1418,
    height: 1391,
  },
  {
    id: 2,
    title: "Approach S72 Golf Biometrics",
    subheader: "Garmin • Product Design • Wearable",
    image: "/projects/garmin-golf-biometrics-s72.jpg",
    href: "/projects/template",
    width: 1705,
    height: 1211,
  },
  {
    id: 3,
    title: "Garmin Explore",
    subheader: "Garmin • Product Design • Web Design",
    image: "/projects/garmin-explore.jpg",
    href: "/projects/template",
    width: 1616,
    height: 923,
  },
  {
    id: 4,
    title: "Yara, for Yummly",
    subheader: "Concept • Conversation UI Design • User Research",
    image: "",
    video: "/projects/project-four.mp4",
    poster: "/projects/project-four-poster.jpg",
    background: YUMMLY_TINT,
    endTitle: "Yara x Yummly",
    href: "/projects/yara",
    // The clip is 16:9, but the frame is deliberately set to the S72 card's
    // ratio so the two sit at a similar height in the grid. The artwork is
    // centred, so cover crops only empty tint from the sides.
    width: 1705,
    height: 1211,
  },
]

/** Rough height of a card's title block, as a fraction of the column width. */
const TEXT_BLOCK = 0.075

/**
 * Splits the projects between the columns so the two finish as close to level
 * as possible. Filling greedily — always adding to whichever column is shortest
 * — is the obvious approach but it commits early and can strand a tall card,
 * leaving one column running hundreds of pixels past the other. With this few
 * projects every order-preserving split can simply be measured, so it picks the
 * best one outright.
 *
 * Heights are counted in column-widths (the thumbnail's own ratio plus its
 * title block), which holds at any screen size.
 */
function packIntoColumns(items: Project[], columnCount: number): Project[][] {
  const cost = (item: Project) => item.height / item.width + TEXT_BLOCK

  let best: { columns: Project[][]; spread: number } | null = null

  // every assignment of items to columns, keeping each column's order
  const total = columnCount ** items.length
  for (let mask = 0; mask < total; mask++) {
    const columns: Project[][] = Array.from({ length: columnCount }, () => [])
    let code = mask
    for (const item of items) {
      columns[code % columnCount].push(item)
      code = Math.floor(code / columnCount)
    }
    if (columns.some((column) => column.length === 0)) continue

    const heights = columns.map((column) =>
      column.reduce((sum, item) => sum + cost(item), 0)
    )
    const spread = Math.max(...heights) - Math.min(...heights)

    // tie-break so the first projects still land across the top row
    const readsInOrder = columns.every((column) =>
      column.every((item, i) =>
        i === 0 ? true : items.indexOf(item) > items.indexOf(column[i - 1])
      )
    )
    if (!readsInOrder) continue
    // the first project has to lead the left column, or the reading order flips
    if (columns[0][0] !== items[0]) continue
    if (!best || spread < best.spread - 0.0001) best = { columns, spread }
  }

  return best!.columns
}

const columns = packIntoColumns(projects, 2)

export default function Home() {
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

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          YUER IS A <em>PRODUCT DESIGNER</em> DRIVEN BY STORYTELLING, CRAFT, AND
          INTENTIONAL DETAILS.
        </h1>
        <p className="hero-subtitle">
          CURRENTLY, SHE&apos;S DESIGNING <em>OUTDOOR EXPERIENCES</em>{' '}
          <a className="link" href={GARMIN} target="_blank" rel="noopener noreferrer">
            @GARMIN
          </a>
          .
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <span className="meta-icon">⊙</span>
            <span>
              BACHELOR OF DESIGN + HCI{' '}
              <a className="link" href={CMU} target="_blank" rel="noopener noreferrer">
                @CARNEGIE MELLON UNIVERSITY
              </a>
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⊙</span>
            <span>
              PREVIOUSLY DESIGNING{' '}
              <a className="link" href={RED_HOUSE} target="_blank" rel="noopener noreferrer">
                @RED HOUSE COMMUNICATIONS
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects">
        <div className="projects-grid">
          {columns.map((column, columnIndex) => (
            <div className="projects-col" key={columnIndex}>
              {column.map((project) => (
                <Link
                  href={project.href}
                  key={project.id}
                  className="project-card"
                  /* restores source order when the columns collapse on mobile */
                  style={{ order: projects.indexOf(project) }}
                >
                  <div
                    className={
                      project.background
                        ? 'project-image project-image--tinted'
                        : 'project-image'
                    }
                    style={{
                      aspectRatio: `${project.width} / ${project.height}`,
                      background: project.background,
                    }}
                  >
                    {project.video ? (
                      <ProjectMedia
                        src={project.video}
                        poster={project.poster}
                        label={project.title}
                        endTitle={project.endTitle}
                      />
                    ) : project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="project-placeholder" />
                    )}
                  </div>
                  <div className="project-info">
                    <h2 className="project-title">{project.title}</h2>
                    {project.subheader && (
                      <p className="project-subheader">{project.subheader}</p>
                    )}
                    {project.description && (
                      <p className="project-desc">{project.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
