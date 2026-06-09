import { createHash } from 'node:crypto'

// computeDebugId derives a deterministic, UUID-shaped id from a chunk's content,
// so the same build always yields the same id (and the .map + the runtime marker
// agree). Matches the server's debug_id format check (^[0-9a-fA-F-]{8,64}$).
export function computeDebugId(content: string): string {
  const h = createHash('sha256').update(content).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

// injectMarker APPENDS a tiny snippet that registers code_file -> debug_id in the
// global the runtime SDK reads. Appended (not prepended) so existing source-map
// line/column mappings stay valid — we never shift original lines.
export function injectMarker(code: string, debugId: string, codeFile: string): string {
  const snippet =
    `\n;(function(){try{(globalThis.__tidenDebugIds=globalThis.__tidenDebugIds||{})` +
    `[${JSON.stringify(codeFile)}]=${JSON.stringify(debugId)};}catch(e){}})();\n`
  return code + snippet
}

// setMapDebugId writes the debugId into the .map JSON (what the server validates
// on confirm). Returns the input unchanged if the map isn't valid JSON.
export function setMapDebugId(mapContent: string, debugId: string): string {
  try {
    const m = JSON.parse(mapContent) as Record<string, unknown>
    m.debugId = debugId
    return JSON.stringify(m)
  } catch {
    return mapContent
  }
}
