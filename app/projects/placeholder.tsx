// A picture that has not been made yet.
//
// The grey box is the site's own `case-ph`; what this adds is the brief for
// what belongs in it, so a page still under construction reads as a plan
// rather than as a column of blank rectangles. Swapping one out later means
// replacing the whole element with the image or clip it describes.

type Props = {
  /** What the finished picture shows. */
  label: string
  /** A brief that is a list rather than a line. */
  items?: string[]
  /** The shape the finished picture is expected to hold. */
  ratio?: string
  /** An extra class, for the one that opens the page. */
  className?: string
}

export default function Placeholder({
  label,
  items,
  ratio = '16 / 9',
  className,
}: Props) {
  return (
    <figure
      className={className ? `case-ph ${className}` : 'case-ph'}
      style={{ aspectRatio: ratio }}
    >
      <figcaption className="case-ph-label">
        {label}
        {items && (
          <ul className="case-ph-list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </figcaption>
    </figure>
  )
}
