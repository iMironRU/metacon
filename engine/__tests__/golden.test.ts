import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { l1Checker, l2Checker } from '../checkers'
import type { L1Answer, L2Answer, L2Core, Trap } from '../contracts'

const repoRoot = join(import.meta.dirname, '..', '..')
const cardsRoot = join(repoRoot, 'cards')

interface GoldenL1 {
  buckets: string[]
  entities: string[]
  expected: L1Answer
  golden_answers: { label: string; expect: 'pass' | 'fail'; trap?: string; answer: L1Answer }[]
}
interface GoldenL2 {
  object: string
  expected_core: L2Core
  golden_answers: { label: string; expect: 'pass' | 'fail'; reason?: string; answer: L2Answer }[]
}
interface Golden { card_id: string; level_1?: GoldenL1; level_2?: GoldenL2 }
interface Card { id: string; traps: Trap[] }

function findGoldenPairs(dir: string): { card: string; golden: string }[] {
  const out: { card: string; golden: string }[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...findGoldenPairs(full))
    else if (entry.isFile() && entry.name.endsWith('.golden.json')) {
      const card = full.replace(/\.golden\.json$/, '.json')
      if (existsSync(card)) out.push({ card, golden: full })
    }
  }
  return out
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, '')
const trapsOverlap = (a: string, b: string) => {
  const [ea] = a.split('→').map(norm)
  const [eb] = b.split('→').map(norm)
  return ea && eb && (ea.includes(eb) || eb.includes(ea))
}

const pairs = findGoldenPairs(cardsRoot)

describe('golden-фикстуры (приёмка эталонов)', () => {
  it('обнаружена хотя бы одна пара card + golden', () => {
    expect(pairs.length).toBeGreaterThan(0)
  })

  for (const { card: cardPath, golden: goldenPath } of pairs) {
    const card = JSON.parse(readFileSync(cardPath, 'utf8')) as Card
    const golden = JSON.parse(readFileSync(goldenPath, 'utf8')) as Golden

    describe(`${card.id}`, () => {
      expect(golden.card_id).toBe(card.id)

      if (golden.level_1) {
        const { expected, golden_answers } = golden.level_1
        describe('L1', () => {
          it.each(golden_answers.map((g) => [g.label, g]))(
            '%s',
            (_label, g: GoldenL1['golden_answers'][number]) => {
              const r = l1Checker(expected, g.answer, card.traps)
              expect(r.verdict).toBe(g.expect)
              if (g.trap) {
                expect(r.trap, `должна сработать ловушка ~ "${g.trap}"`).toBeDefined()
                expect(trapsOverlap(r.trap!, g.trap)).toBe(true)
              }
            },
          )
        })
      }

      if (golden.level_2) {
        const { expected_core, golden_answers } = golden.level_2
        describe('L2', () => {
          it.each(golden_answers.map((g) => [g.label, g]))(
            '%s',
            (_label, g: GoldenL2['golden_answers'][number]) => {
              const r = l2Checker(expected_core, g.answer)
              expect(r.verdict).toBe(g.expect)
            },
          )
        })
      }
    })
  }
})
