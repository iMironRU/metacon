import { describe, it, expect } from 'vitest'
import { l1Checker, l2Checker } from '../checkers'
import type { Trap } from '../contracts'

const traps: Trap[] = [
  { lure: 'Партия → Справочник', correct: 'Партия → измерение РН', why: '...' },
  {
    lure: 'Метод списания (ФИФО/ЛИФО) → реквизит документа',
    correct: 'Метод → ресурс периодического РС УчётнаяПолитика',
    why: '...',
  },
]

describe('l1Checker', () => {
  const expected = { Номенклатура: 'Справочник', Партия: 'Измерение' }

  it('pass на точном совпадении', () => {
    expect(l1Checker(expected, expected, traps).verdict).toBe('pass')
  })

  it('fail и срабатывает trap при ошибке партия → справочник', () => {
    const r = l1Checker(expected, { ...expected, Партия: 'Справочник' }, traps)
    expect(r.verdict).toBe('fail')
    expect(r.trap).toBe('Партия → Справочник')
  })

  it('fail при отсутствующем ответе', () => {
    const r = l1Checker(expected, { Номенклатура: 'Справочник' } as never, traps)
    expect(r.verdict).toBe('fail')
    expect(r.mismatches[0]).toContain('нет ответа')
  })
})

describe('l2Checker', () => {
  const core = { dimensions: ['Номенклатура', 'Партия'], resources: ['Количество', 'Стоимость'] }

  it('pass на точном ядре', () => {
    expect(l2Checker(core, { ...core }).verdict).toBe('pass')
  })

  it('pass когда есть лишние атрибуты', () => {
    expect(l2Checker(core, { ...core, attributes: ['Комментарий'] }).verdict).toBe('pass')
  })

  it('fail без обязательного измерения', () => {
    const r = l2Checker(core, { dimensions: ['Номенклатура'], resources: core.resources })
    expect(r.verdict).toBe('fail')
    expect(r.mismatches.join(' ')).toContain('Партия')
  })

  it('fail когда измерение указано как ресурс', () => {
    const r = l2Checker(core, {
      dimensions: ['Номенклатура'],
      resources: [...core.resources, 'Партия'],
    })
    expect(r.verdict).toBe('fail')
    expect(r.mismatches.join(' ')).toMatch(/Партия.*ресурс/)
  })
})
