// app/layout.tsx
import type { Metadata } from 'next'
import Parallax from './parallax'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yuer Zhu — Product Designer',
  description: 'Product designer driven by storytelling, craft, and intentional details.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* every `data-parallax` on whatever page is up, driven from one place */}
        <Parallax />
        {children}
      </body>
    </html>
  )
}
