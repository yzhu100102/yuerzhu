// The gate visitors land on when they open a protected project.

import Link from 'next/link'

export default async function LockedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const next = typeof params.next === 'string' ? params.next : '/'
  const wrongPassword = params.error === '1'
  const noPasswordSet = params.unset === '1'

  return (
    <main className="main">
      <nav className="nav">
        <Link href="/" className="nav-name">YUER ZHU</Link>
        <div className="nav-links">
          <Link href="/" className="is-active">WORK</Link>
          <Link href="/play">PLAY</Link>
          <Link href="/about">ABOUT</Link>
        </div>
      </nav>

      <article className="case">
        <section className="gate">
          <h2 className="case-heading">PROTECTED</h2>
          <p className="case-lead">This work is under wraps.</p>
          <p className="case-text">
            The Garmin projects are covered by an agreement, so they sit behind
            a password. Ask me for it and it will open the three of them.{' '}
            <Link className="link" href="/projects/yara">
              The Yara case study
            </Link>{' '}
            is open to read.
          </p>

          {noPasswordSet ? (
            <p className="gate-note">
              No password is configured on this site yet, so nothing can be
              unlocked. Set <code>PROJECT_PASSWORD</code> in{' '}
              <code>.env.local</code> and restart the server.
            </p>
          ) : (
            <form className="gate-form" method="POST" action="/api/unlock">
              <input type="hidden" name="next" value={next} />
              <label className="gate-field">
                <span className="gate-field-label">PASSWORD</span>
                <input
                  className="gate-input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                />
              </label>
              <button className="gate-button" type="submit">
                ENTER
              </button>
            </form>
          )}

          {wrongPassword && (
            <p className="gate-note gate-note--error">
              That password did not match. Try again.
            </p>
          )}

          <p className="case-next">
            <Link href="/">← BACK TO ALL WORK</Link>
          </p>
        </section>
      </article>
    </main>
  )
}
