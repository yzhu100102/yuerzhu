# Backups

Point-in-time copies, kept so a layout can be put back by hand without going
through git.

## home-page-grid-2026-08-22.tsx

The two-column staggered project grid the home page used before it became the
scroll-through work stage. To restore it:

    cp backups/home-page-grid-2026-08-22.tsx app/page.tsx

It is a server component and depends only on `project-media.tsx` and `links.ts`,
both unchanged. The grid's styles (`.projects`, `.projects-grid`,
`.projects-col`, `.project-card` and the rest) are still in `app/globals.css`,
so restoring the file is all that is needed.

## globals-2026-08-22.css

The stylesheet as it stood at the same moment.
