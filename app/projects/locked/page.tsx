// The gate visitors land on when they open a protected project. One screen,
// centred, with nothing on it but the field, its label and the way back.

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
    <main className="main gate-page">
      <nav className="nav">
        <Link href="/" className="nav-name">YUER ZHU</Link>
        <div className="nav-links">
          <Link href="/" className="is-active">WORK</Link>
          <Link href="/play">PLAY</Link>
          <Link href="/about">ABOUT</Link>
        </div>
      </nav>

      <section className="gate">
        {noPasswordSet ? (
          <p className="gate-note">
            No password is configured on this site yet, so nothing can be
            unlocked. Set <code>PROJECT_PASSWORD</code> in the environment and
            restart the server.
          </p>
        ) : (
          <form className="gate-form" method="POST" action="/api/unlock">
            <input type="hidden" name="next" value={next} />
            <label className="gate-field">
              <span className="gate-field-label">Password</span>
              {/* Shown rather than dotted: this is one shared phrase handed
                  out to people looking at a portfolio, not an account, and
                  seeing it typed is worth more here than hiding it is. */}
              <input
                className="gate-input"
                name="password"
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                required
              />
            </label>
            <button className="gate-button" type="submit">
              Enter
            </button>
          </form>
        )}

        {wrongPassword && (
          <p className="gate-note gate-note--error">
            That password did not match. Try again.
          </p>
        )}

        <Link className="gate-back" href="/">
          ← Back to work
        </Link>
      </section>
    </main>
  )
}
