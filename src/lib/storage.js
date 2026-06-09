import { v4 as uuidv4 } from 'uuid'

const DOCS_KEY = 'fountain_docs'
const ACTIVE_KEY = 'fountain_active_id'

export function loadAllDocs() {
  try {
    const raw = localStorage.getItem(DOCS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveAllDocs(docs) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
}

export function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) ?? null
}

export function saveActiveId(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function createDoc(title = 'Untitled') {
  return {
    id: uuidv4(),
    title,
    content: defaultContent(title),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function updateDoc(docs, id, patch) {
  return docs.map(doc =>
    doc.id === id ? { ...doc, ...patch, updatedAt: Date.now() } : doc
  )
}

export function deleteDoc(docs, id) {
  return docs.filter(doc => doc.id !== id)
}

function defaultContent(title) {
  return `Title: ${title}
Author:
Draft Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

INT. LOCATION - DAY

Action description goes here.

CHARACTER
Dialogue goes here.
`
}
