// Wraps every project route. It draws nothing of its own — it is here so that
// each case study is noted as the reader opens it, and the work can put that
// project's card up when they come back.

import RememberCard from './remember-card'

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <RememberCard />
    </>
  )
}
