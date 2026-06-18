import type { GradeResult, L1Answer, L2Answer, L2Core, Trap } from './contracts'

const normalize = (s: string) =>
  s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, '')

function splitCamel(s: string): string[] {
  return s.replace(/([а-яa-z])([А-ЯA-Z])/g, '$1 $2').split(/\s+/).filter(Boolean)
}

function findTrapFor(entity: string, wrongBucket: string, traps: Trap[]): Trap | undefined {
  const lit = normalize(`${entity}→${wrongBucket}`)
  const wordsExact = traps.find((t) => normalize(t.lure).includes(lit))
  if (wordsExact) return wordsExact

  const tokens = splitCamel(entity).map(normalize)
  return traps.find((t) => {
    const lure = normalize(t.lure)
    return tokens.some((tok) => tok.length >= 4 && lure.includes(tok))
  })
}

export const l1Checker = (
  expected: L1Answer,
  answer: L1Answer,
  traps: Trap[],
): GradeResult => {
  const mismatches: string[] = []
  let triggeredTrap: string | undefined

  for (const entity of Object.keys(expected)) {
    const want = expected[entity]
    const got = answer[entity]
    if (got === undefined) {
      mismatches.push(`${entity}: нет ответа (ожидался "${want}")`)
      continue
    }
    if (got !== want) {
      mismatches.push(`${entity}: ожидался "${want}", дан "${got}"`)
      if (!triggeredTrap) {
        const t = findTrapFor(entity, got, traps)
        if (t) triggeredTrap = t.lure
      }
    }
  }

  for (const entity of Object.keys(answer)) {
    if (!(entity in expected)) {
      mismatches.push(`${entity}: вне ожидаемого набора`)
    }
  }

  return mismatches.length === 0
    ? { verdict: 'pass', mismatches: [] }
    : { verdict: 'fail', mismatches, ...(triggeredTrap ? { trap: triggeredTrap } : {}) }
}

export const l2Checker = (core: L2Core, answer: L2Answer): GradeResult => {
  const mismatches: string[] = []
  const dims = new Set(answer.dimensions)
  const ress = new Set(answer.resources)

  for (const dim of core.dimensions) {
    if (!dims.has(dim)) mismatches.push(`нет измерения "${dim}"`)
    if (ress.has(dim)) mismatches.push(`"${dim}" указано как ресурс, должно быть измерение`)
  }
  for (const res of core.resources) {
    if (!ress.has(res)) mismatches.push(`нет ресурса "${res}"`)
    if (dims.has(res)) mismatches.push(`"${res}" указано как измерение, должно быть ресурс`)
  }

  return mismatches.length === 0
    ? { verdict: 'pass', mismatches: [] }
    : { verdict: 'fail', mismatches }
}
