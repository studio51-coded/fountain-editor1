import { useState } from 'react'

export default function Sidebar({ docs, activeId, onSelect, onCreate, onRename, onDelete }) {
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  function startRename(doc, e) {
    e.stopPropagation()
    setRenamingId(doc.id)
    setRenameValue(doc.title)
  }

  function commitRename(id) {
    const trimmed = renameValue.trim()
    if (trimmed) onRename(id, trimmed)
    setRenamingId(null)
  }

  function handleRenameKey(e, id) {
    if (e.key === 'Enter') commitRename(id)
    if (e.key === 'Escape') setRenamingId(null)
  }

  return (
    <aside className="no-print flex flex-col w-56 min-w-[12rem] bg-zinc-950 border-r border-zinc-800 h-screen">
      <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Scripts</span>
        <button
          onClick={onCreate}
          className="text-zinc-400 hover:text-violet-400 transition-colors text-lg leading-none"
          title="New script"
        >
          +
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {docs.length === 0 && (
          <p className="text-xs text-zinc-600 px-3 py-4">No scripts yet. Hit + to start.</p>
        )}
        {docs.map(doc => (
          <div
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`group flex items-center gap-1 px-3 py-2 cursor-pointer text-sm transition-colors ${
              doc.id === activeId
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            {renamingId === doc.id ? (
              <input
                autoFocus
                className="flex-1 bg-zinc-700 text-zinc-100 text-xs px-1 py-0.5 rounded outline-none"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => commitRename(doc.id)}
                onKeyDown={e => handleRenameKey(e, doc.id)}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 truncate">{doc.title}</span>
            )}

            {renamingId !== doc.id && (
              <span className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={e => startRename(doc, e)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                  title="Rename"
                >
                  ✎
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(doc.id) }}
                  className="text-zinc-500 hover:text-red-400 text-xs"
                  title="Delete"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-zinc-800 text-xs text-zinc-600">
        Fountain Editor
      </div>
    </aside>
  )
}
