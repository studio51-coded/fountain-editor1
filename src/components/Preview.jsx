import { useMemo } from 'react'
import { parseFountain, renderInline } from '../lib/fountain'

export default function Preview({ content }) {
  const tokens = useMemo(() => parseFountain(content), [content])

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-800 py-10 px-4">
      <div className="screenplay-page">
        {tokens.map((token, idx) => renderToken(token, idx))}
      </div>
    </div>
  )
}

function renderToken(token, idx) {
  switch (token.type) {
    case 'title_page':
      return (
        <div key={idx} className="fn-title-page">
          {token.data.title && <div className="title">{token.data.title}</div>}
          {token.data.credit && <div>{token.data.credit}</div>}
          {(token.data.author || token.data.authors) && (
            <div>{token.data.author || token.data.authors}</div>
          )}
          {token.data.source && <div>{token.data.source}</div>}
          {(token.data['draft date'] || token.data.date) && (
            <div style={{ marginTop: '2em' }}>{token.data['draft date'] || token.data.date}</div>
          )}
          {token.data.contact && (
            <div style={{ marginTop: '1em', whiteSpace: 'pre-line' }}>{token.data.contact}</div>
          )}
          <hr style={{ margin: '2em 0', borderColor: '#ccc' }} />
        </div>
      )

    case 'scene_heading':
      return (
        <p key={idx} className="fn-scene-heading">
          {token.text}
        </p>
      )

    case 'action':
      return (
        <p
          key={idx}
          className="fn-action"
          dangerouslySetInnerHTML={{ __html: renderInline(token.text) }}
        />
      )

    case 'character':
      return (
        <p key={idx} className="fn-character">
          {token.name}
          {token.extension && <span style={{ fontWeight: 'normal' }}> {token.extension}</span>}
        </p>
      )

    case 'dialogue':
      return (
        <p
          key={idx}
          className="fn-dialogue"
          dangerouslySetInnerHTML={{ __html: renderInline(token.text) }}
        />
      )

    case 'parenthetical':
      return (
        <p key={idx} className="fn-parenthetical">
          {token.text}
        </p>
      )

    case 'transition':
      return (
        <p key={idx} className="fn-transition">
          {token.text}
        </p>
      )

    case 'centered':
      return (
        <p
          key={idx}
          className="fn-centered"
          dangerouslySetInnerHTML={{ __html: renderInline(token.text) }}
        />
      )

    case 'lyrics':
      return (
        <p key={idx} className="fn-action" style={{ fontStyle: 'italic' }}>
          {token.text}
        </p>
      )

    case 'page_break':
      return <hr key={idx} style={{ borderColor: '#ccc', margin: '2em 0' }} />

    case 'section':
    case 'synopsis':
      // These are structural/notes — omit from formatted output
      return null

    default:
      return null
  }
}
