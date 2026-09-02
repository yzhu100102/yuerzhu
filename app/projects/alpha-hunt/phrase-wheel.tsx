// The one sentence the whole feature is measured against, read out one phrase
// at a time on a wheel that never stops turning — the way the tool itself is
// meant to be used: a glance, an answer, back to what you were doing. The
// sentence finished, the panel goes to black, signs off, and holds empty for a
// beat before it comes round again.
//
// The whole sequence is CSS, on one seven-second clock every part of it shares:
// three phrases at a second and a half each, the sign-off, then the beat of
// black. See the `wheel-*` keyframes in globals.css.

const phrases = [
  'Open the tool,',
  'understand your surroundings,',
  'get back to the hunt.',
]

export default function PhraseWheel() {
  return (
    <div className="wheel">
      {/* The sentence, said once, for anything that does not watch it turn. */}
      <p className="wheel-sr">{phrases.join(' ')}</p>

      {/* The wheel carries the sentence and nothing else: above the first
          phrase is empty, below the last is empty, and it is only in the
          middle of the sentence that a phrase has a neighbour either side. */}
      <div className="wheel-window" aria-hidden="true">
        <div className="wheel-track">
          {phrases.map((phrase) => (
            <span className="wheel-phrase" key={phrase}>
              {phrase}
            </span>
          ))}
        </div>
      </div>

      {/* Black over the top of the wheel once the sentence is finished. It
          carries the sign-off, then holds after the sign-off has gone. */}
      <div className="wheel-curtain" aria-hidden="true">
        {/* Stand-in for the wordmark. Drop the real file into
            public/projects/garmin-logo.svg and swap this span for an
            <Image> of it; nothing else about the sequence changes. */}
        <span className="wheel-logo">GARMIN</span>
      </div>
    </div>
  )
}
