import type { L1Answer, L2Core, L2Answer } from '../../engine/contracts'

export interface GoldenL1 {
  buckets: string[]
  entities: string[]
  expected: L1Answer
  golden_answers: { label: string; expect: 'pass' | 'fail'; trap?: string; answer: L1Answer }[]
}

export interface GoldenL2 {
  object: string
  expected_core: L2Core
  golden_answers: { label: string; expect: 'pass' | 'fail'; reason?: string; answer: L2Answer }[]
}

export interface Golden {
  card_id: string
  note?: string
  level_1?: GoldenL1
  level_2?: GoldenL2
}
