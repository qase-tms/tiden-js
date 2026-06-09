import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { computeDebugId, injectMarker, setMapDebugId } from './core.js'

export interface ProcessedMap {
  /** path relative to the processed dir, used as the code_file registry key */
  fileName: string
  debugId: string
  mapPath: string
}

// processDir walks an output directory, and for every `*.js` with a sibling
// `*.js.map`: computes a debug-id from the JS, injects the runtime marker into
// the JS, and writes the debug-id into the map. Returns one entry per processed
// map (for upload). Filesystem-based so it is bundler-agnostic.
export function processDir(dir: string): ProcessedMap[] {
  const out: ProcessedMap[] = []
  for (const abs of walk(dir)) {
    if (!abs.endsWith('.js')) continue
    const mapPath = abs + '.map'
    if (!existsSync(mapPath)) continue

    const code = readFileSync(abs, 'utf8')
    const rel = relative(dir, abs)
    const debugId = computeDebugId(code)
    writeFileSync(abs, injectMarker(code, debugId, rel))
    writeFileSync(mapPath, setMapDebugId(readFileSync(mapPath, 'utf8'), debugId))
    out.push({ fileName: rel, debugId, mapPath })
  }
  return out
}

function walk(dir: string): string[] {
  const acc: string[] = []
  const visit = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name)
      if (statSync(p).isDirectory()) visit(p)
      else acc.push(p)
    }
  }
  if (existsSync(dir)) visit(dir)
  return acc
}
