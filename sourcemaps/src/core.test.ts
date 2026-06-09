import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { computeDebugId, injectMarker, setMapDebugId } from './core'
import { processDir } from './process'

describe('computeDebugId', () => {
  it('is deterministic, uuid-shaped, content-sensitive', () => {
    const a = computeDebugId('console.log(1)')
    expect(computeDebugId('console.log(1)')).toBe(a)
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    expect(computeDebugId('other')).not.toBe(a)
  })
})

describe('injectMarker', () => {
  it('appends a registry snippet carrying id + codeFile (does not shift original code)', () => {
    const out = injectMarker('CODE', 'id-1', 'assets/main.js')
    expect(out.startsWith('CODE')).toBe(true)
    expect(out).toContain('__tidenDebugIds')
    expect(out).toContain('id-1')
    expect(out).toContain('assets/main.js')
  })
})

describe('setMapDebugId', () => {
  it('writes debugId into the map json', () => {
    expect(JSON.parse(setMapDebugId('{"version":3,"sources":[]}', 'id-2')).debugId).toBe('id-2')
  })
  it('returns input unchanged on bad json', () => {
    expect(setMapDebugId('not json', 'x')).toBe('not json')
  })
})

describe('processDir', () => {
  it('injects marker into js and debugId into the sibling map', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tsm-'))
    mkdirSync(join(dir, 'assets'))
    const js = join(dir, 'assets', 'main.4f3a.js')
    writeFileSync(js, 'export const x=1;')
    writeFileSync(js + '.map', '{"version":3,"sources":["x.ts"]}')

    const res = processDir(dir)
    expect(res).toHaveLength(1)
    expect(res[0]!.fileName).toBe(join('assets', 'main.4f3a.js'))
    expect(readFileSync(js, 'utf8')).toContain('__tidenDebugIds')
    expect(JSON.parse(readFileSync(js + '.map', 'utf8')).debugId).toBe(res[0]!.debugId)
  })
})
