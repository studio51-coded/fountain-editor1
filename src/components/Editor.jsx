import { useRef, useEffect } from 'react'

export default function Editor({ content, onChange }) {
  const textareaRef = useRef(null)

  // Auto-resize not needed — we use h-full. Keep focus on mount.
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleKeyDown(e) {
    // Tab → two spaces (screenplay uses spaces not tabs)
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = el.value.substring(0, start) + '  ' + el.value.substring(end)
      onChange(next)
      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <textarea
        ref={textareaRef}
        className="editor-textarea flex-1 p-8"
        value={content}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Start writing your screenplay in Fountain format…"
      />
    </div>
  )
}
