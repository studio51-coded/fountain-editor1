// Fountain screenplay parser
// Spec: https://fountain.io/syntax

export function parseFountain(text) {
  const lines = text.split('\n')
  const tokens = []
  let i = 0

  // Title page: key: value pairs before the first blank line
  const titlePage = {}
  let inTitlePage = true
  const titlePageKeys = ['title', 'credit', 'author', 'authors', 'source', 'draft date', 'date', 'contact', 'copyright', 'notes']

  while (i < lines.length && inTitlePage) {
    const line = lines[i]
    const titleMatch = line.match(/^([^:]+):\s*(.*)$/)
    if (titleMatch && titlePageKeys.includes(titleMatch[1].trim().toLowerCase())) {
      titlePage[titleMatch[1].trim().toLowerCase()] = titleMatch[2].trim()
      i++
    } else if (line.trim() === '' && Object.keys(titlePage).length > 0) {
      i++
      break
    } else {
      inTitlePage = false
    }
  }

  if (Object.keys(titlePage).length > 0) {
    tokens.push({ type: 'title_page', data: titlePage })
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Blank line — paragraph separator
    if (trimmed === '') {
      i++
      continue
    }

    // Forced scene heading
    if (trimmed.startsWith('.') && !trimmed.startsWith('..')) {
      tokens.push({ type: 'scene_heading', text: trimmed.slice(1).trim() })
      i++
      continue
    }

    // Scene heading: INT./EXT. etc.
    if (/^(INT|EXT|INT\.\/EXT|I\/E)[\.\s]/i.test(trimmed)) {
      tokens.push({ type: 'scene_heading', text: trimmed.toUpperCase() })
      i++
      continue
    }

    // Forced transition
    if (trimmed.startsWith('>') && !trimmed.endsWith('<')) {
      tokens.push({ type: 'transition', text: trimmed.slice(1).trim() })
      i++
      continue
    }

    // Centered text
    if (trimmed.startsWith('>') && trimmed.endsWith('<')) {
      tokens.push({ type: 'centered', text: trimmed.slice(1, -1).trim() })
      i++
      continue
    }

    // Transition: line ending with TO: (all caps)
    if (/^[A-Z ]+TO:$/.test(trimmed)) {
      tokens.push({ type: 'transition', text: trimmed })
      i++
      continue
    }

    // Section heading
    if (trimmed.startsWith('#')) {
      const level = trimmed.match(/^(#+)/)[1].length
      tokens.push({ type: 'section', level, text: trimmed.replace(/^#+\s*/, '') })
      i++
      continue
    }

    // Synopsis
    if (trimmed.startsWith('=')) {
      tokens.push({ type: 'synopsis', text: trimmed.slice(1).trim() })
      i++
      continue
    }

    // Page break
    if (/^={3,}$/.test(trimmed)) {
      tokens.push({ type: 'page_break' })
      i++
      continue
    }

    // Forced character
    if (trimmed.startsWith('@')) {
      const charText = trimmed.slice(1).trim()
      const { name, extension } = parseCharacterLine(charText)
      tokens.push({ type: 'character', name, extension })
      i++
      const dialogueBlock = consumeDialogueBlock(lines, i)
      tokens.push(...dialogueBlock.tokens)
      i = dialogueBlock.nextIndex
      continue
    }

    // Character: ALL CAPS line, optionally followed by parenthetical extension
    // Must be followed by dialogue
    if (isCharacterLine(trimmed, lines, i)) {
      const { name, extension } = parseCharacterLine(trimmed)
      tokens.push({ type: 'character', name, extension })
      i++
      const dialogueBlock = consumeDialogueBlock(lines, i)
      tokens.push(...dialogueBlock.tokens)
      i = dialogueBlock.nextIndex
      continue
    }

    // Forced action
    if (trimmed.startsWith('!')) {
      tokens.push({ type: 'action', text: trimmed.slice(1) })
      i++
      continue
    }

    // Lyric
    if (trimmed.startsWith('~')) {
      tokens.push({ type: 'lyrics', text: trimmed.slice(1).trim() })
      i++
      continue
    }

    // Default: action paragraph (collect until blank line)
    const actionLines = [line]
    i++
    while (i < lines.length && lines[i].trim() !== '') {
      actionLines.push(lines[i])
      i++
    }
    tokens.push({ type: 'action', text: actionLines.join('\n') })
  }

  return tokens
}

function isCharacterLine(trimmed, lines, i) {
  if (!/^[A-Z][A-Z0-9 \t'!?.,-]*(\s*\(.*\))?$/.test(trimmed)) return false
  // Must have something after it (next non-blank line is dialogue or parenthetical)
  let j = i + 1
  while (j < lines.length && lines[j].trim() === '') j++
  if (j >= lines.length) return false
  const next = lines[j].trim()
  return next !== '' && !isSceneHeading(next)
}

function isSceneHeading(text) {
  return /^(INT|EXT|INT\.\/EXT|I\/E)[\.\s]/i.test(text)
}

function parseCharacterLine(text) {
  const match = text.match(/^(.*?)\s*(\(.*\))\s*$/)
  if (match) return { name: match[1].trim(), extension: match[2] }
  return { name: text.trim(), extension: null }
}

function consumeDialogueBlock(lines, startIndex) {
  const tokens = []
  let i = startIndex

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      // Check for dual dialogue continuation — skip blank, peek ahead
      i++
      break
    }

    // Parenthetical
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      tokens.push({ type: 'parenthetical', text: trimmed })
      i++
      continue
    }

    // Dialogue line
    tokens.push({ type: 'dialogue', text: trimmed })
    i++
  }

  return { tokens, nextIndex: i }
}

// Inline formatting: *italic*, **bold**, ***bold italic***, _underline_
export function renderInline(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<u>$1</u>')
    // Note: [[note]] — suppress in output
    .replace(/\[\[.*?\]\]/g, '')
}
