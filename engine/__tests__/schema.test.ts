import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const repoRoot = join(import.meta.dirname, '..', '..')
const schemaPath = join(repoRoot, 'schema', 'mechanism-card.schema.json')
const cardsRoot = join(repoRoot, 'cards')

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)

function collectCards(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectCards(full))
    else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.endsWith('.golden.json')) {
      out.push(full)
    }
  }
  return out
}

describe('mechanism-card schema', () => {
  const cards = collectCards(cardsRoot)

  it('обнаруживает хотя бы одну карточку', () => {
    expect(cards.length).toBeGreaterThan(0)
  })

  it.each(cards)('валидна по схеме: %s', (cardPath) => {
    const card = JSON.parse(readFileSync(cardPath, 'utf8'))
    const ok = validate(card)
    if (!ok) {
      const msg = (validate.errors ?? [])
        .map((e) => `  ${e.instancePath || '/'} ${e.message} ${JSON.stringify(e.params)}`)
        .join('\n')
      throw new Error(`Schema validation failed for ${cardPath}:\n${msg}`)
    }
    expect(ok).toBe(true)
  })
})
