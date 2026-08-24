// app/layout.tsx
import type { Metadata } from 'next'
import { KnotDefs } from './knot'
import Parallax from './parallax'
import './globals.css'

const TITLE = 'Yuer Zhu — Product Designer'
const DESCRIPTION =
  'Product designer driven by storytelling, craft, and intentional details.'

export const metadata: Metadata = {
  // What relative URLs in this block are resolved against. Without it Next
  // falls back to localhost, and every link shared out of a deployed build
  // points its preview image at a machine nobody else can reach. Set
  // NEXT_PUBLIC_SITE_URL in the host's environment if the domain ever moves.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yuerzhu.com'),
  title: TITLE,
  description: DESCRIPTION,
  // `app/opengraph-image.png` is the home page itself. Declared on the root
  // layout so every page inherits it: sending anyone a link to a project
  // should still show the site, not whichever picture that page happens to
  // start with.
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* the one copy of the mark, which every knot on the page points at */}
        <KnotDefs />
        {/* every `data-parallax` on whatever page is up, driven from one place */}
        <Parallax />
        {children}
      </body>
    </html>
  )
}
