import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import {
  loadAllDocs,
  saveAllDocs,
  loadActiveId,
  saveActiveId,
  createDoc,
  updateDoc,
  deleteDoc,
} from './lib/storage'

export default function App() {
  const [docs, setDocs] = useState(() => {
    const saved = loadAllDocs()
    if (saved.length > 0) return saved
    const first = createDoc('My Screenplay')
    return [first]
  })

  const [activeId, setActiveId] = useState(() => {
    const saved = loadActiveId()
    return saved ?? null
  })

  const [view, setView] = useState('split') // 'editor' | 'preview' | 'split'
  const saveTimer = useRef(null)

  // Resolve activeId: if null or not found, use first doc
  const resolvedActiveId = docs.find(d => d.id === activeId)?.id ?? docs[0]?.id ?? null
  const activeDoc = docs.find(d => d.id === resolvedActiveId)

  // Persist docs whenever they change (debounced 400ms)
  useEffect(() => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveAllDocs(docs)
    }, 400)
    return () => clearTimeout(saveTimer.current)
  }, [docs])

  // Persist active id
  useEffect(() => {
    if (resolvedActiveId) saveActiveId(resolvedActiveId)
  }, [resolvedActiveId])

  const handleContentChange = useCallback((content) => {
    setDocs(prev => updateDoc(prev, resolvedActiveId, { content }))
  }, [resolvedActiveId])

  function handleCreate() {
    const doc = createDoc('Untitled')
    setDocs(prev => [...prev, doc])
    setActiveId(doc.id)
  }

  function handleRename(id, title) {
    setDocs(prev => updateDoc(prev, id, { title }))
  }

  function handleDelete(id) {
    if (docs.length === 1) return // keep at least one
    const remaining = deleteDoc(docs, id)
    setDocs(remaining)
    if (id === resolvedActiveId) {
      setActiveId(remaining[0]?.id ?? null)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        docs={docs}
        activeId={resolvedActiveId}
        onSelect={setActiveId}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <header className="no-print flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <span className="text-sm text-zinc-300 font-semibold truncate max-w-xs">
            {activeDoc?.title ?? ''}
          </span>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-zinc-800 rounded overflow-hidden text-xs">
              {[['editor', 'Write'], ['split', 'Split'], ['preview', 'Preview']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`px-3 py-1 transition-colors ${
                    view === key ? 'bg-violet-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="text-xs px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
              title="Print / Export PDF"
            >
              Print
            </button>
          </div>
        </header>

        {/* Main pane */}
        <main className="flex flex-1 overflow-hidden">
          {activeDoc ? (
            <>
              {(view === 'editor' || view === 'split') && (
                <div className={`flex flex-col overflow-hidden ${view === 'split' ? 'w-1/2 border-r border-zinc-800' : 'flex-1'}`}>
                  <Editor
                    key={activeDoc.id}
                    content={activeDoc.content}
                    onChange={handleContentChange}
                  />
                </div>
              )}

              {(view === 'preview' || view === 'split') && (
                <div className={`overflow-hidden ${view === 'split' ? 'w-1/2' : 'flex-1'} flex`}>
                  <Preview content={activeDoc.content} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              No script selected
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
