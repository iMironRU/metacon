import { useMemo, useState } from 'react'
import { l1Checker } from '../engine/checkers'
import type { GradeResult, L1Answer, Trap } from '../engine/contracts'
import './L1Widget.css'

interface Props {
  title?: string
  buckets: string[]
  entities: string[]
  expected: L1Answer
  traps: Trap[]
  onResult?: (r: GradeResult) => void
}

type Placement = Record<string, string | undefined>

const UNPLACED = '__unplaced__'

export function L1Widget({ title, buckets, entities, expected, traps, onResult }: Props) {
  const [placement, setPlacement] = useState<Placement>(() =>
    Object.fromEntries(entities.map((e) => [e, undefined])),
  )
  const [dragging, setDragging] = useState<string | null>(null)
  const [hoverBucket, setHoverBucket] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)

  const placedAll = useMemo(
    () => entities.every((e) => placement[e] !== undefined),
    [entities, placement],
  )

  function moveTo(entity: string, bucket: string | typeof UNPLACED) {
    setPlacement((prev) => ({ ...prev, [entity]: bucket === UNPLACED ? undefined : bucket }))
    if (submitted) {
      setSubmitted(false)
      setResult(null)
    }
  }

  function onDragStart(e: React.DragEvent, entity: string) {
    setDragging(entity)
    e.dataTransfer.setData('text/plain', entity)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e: React.DragEvent, bucket: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (hoverBucket !== bucket) setHoverBucket(bucket)
  }

  function onDrop(e: React.DragEvent, bucket: string) {
    e.preventDefault()
    const entity = e.dataTransfer.getData('text/plain') || dragging
    if (entity) moveTo(entity, bucket)
    setDragging(null)
    setHoverBucket(null)
  }

  function handleCheck() {
    const answer: L1Answer = {}
    for (const e of entities) {
      const b = placement[e]
      if (b) answer[e] = b
    }
    const r = l1Checker(expected, answer, traps)
    setResult(r)
    setSubmitted(true)
    onResult?.(r)
  }

  function handleReset() {
    setPlacement(Object.fromEntries(entities.map((e) => [e, undefined])))
    setSubmitted(false)
    setResult(null)
  }

  const wrongEntities = useMemo(() => {
    if (!submitted || !result || result.verdict === 'pass') return new Set<string>()
    return new Set(result.mismatches.map((m) => m.split(':')[0]))
  }, [submitted, result])

  const triggeredTrap = useMemo(
    () => (result?.trap ? traps.find((t) => t.lure === result.trap) : undefined),
    [result, traps],
  )

  const unplaced = entities.filter((e) => placement[e] === undefined)

  return (
    <section className="l1">
      {title ? <h2 className="l1-title">{title}</h2> : null}
      <p className="l1-help">
        Перетащите каждую сущность в соответствующую корзину. Когда все расставлены — нажмите «Проверить».
      </p>

      <div
        className={`l1-pool${dragging ? ' is-dragging' : ''}${hoverBucket === UNPLACED ? ' is-hover' : ''}`}
        onDragOver={(e) => onDragOver(e, UNPLACED)}
        onDrop={(e) => onDrop(e, UNPLACED)}
        onDragLeave={() => setHoverBucket(null)}
      >
        <div className="l1-pool-label">Не разложено ({unplaced.length})</div>
        <div className="l1-chips">
          {unplaced.map((e) => (
            <Chip
              key={e}
              entity={e}
              draggable
              onDragStart={(ev) => onDragStart(ev, e)}
              onDragEnd={() => setDragging(null)}
            />
          ))}
        </div>
      </div>

      <div className="l1-buckets">
        {buckets.map((bucket) => {
          const inside = entities.filter((e) => placement[e] === bucket)
          return (
            <div
              key={bucket}
              className={`l1-bucket${hoverBucket === bucket ? ' is-hover' : ''}`}
              onDragOver={(e) => onDragOver(e, bucket)}
              onDragLeave={() => setHoverBucket(null)}
              onDrop={(e) => onDrop(e, bucket)}
            >
              <div className="l1-bucket-head">
                <span className="l1-bucket-name">{bucket}</span>
                <span className="l1-bucket-count">{inside.length}</span>
              </div>
              <div className="l1-chips">
                {inside.map((e) => {
                  const state =
                    submitted && result
                      ? expected[e] === bucket
                        ? 'ok'
                        : wrongEntities.has(e)
                          ? 'bad'
                          : undefined
                      : undefined
                  return (
                    <Chip
                      key={e}
                      entity={e}
                      state={state}
                      draggable
                      onDragStart={(ev) => onDragStart(ev, e)}
                      onDragEnd={() => setDragging(null)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="l1-actions">
        <button className="primary" onClick={handleCheck} disabled={!placedAll}>
          Проверить
        </button>
        <button onClick={handleReset} disabled={unplaced.length === entities.length && !submitted}>
          Сбросить
        </button>
        {!placedAll ? <span className="l1-hint">осталось разложить: {unplaced.length}</span> : null}
      </div>

      {submitted && result ? (
        <div className={`l1-feedback verdict-${result.verdict}`}>
          {result.verdict === 'pass' ? (
            <p className="l1-feedback-headline">✓ Верно. Классификация совпадает с эталоном.</p>
          ) : (
            <>
              <p className="l1-feedback-headline">✗ Есть расхождения.</p>
              <ul className="l1-mismatches">
                {result.mismatches.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
              {triggeredTrap ? (
                <div className="l1-trap">
                  <div className="l1-trap-label">Сработала ловушка</div>
                  <div className="l1-trap-lure">{triggeredTrap.lure}</div>
                  <div className="l1-trap-correct">
                    <strong>Верно:</strong> {triggeredTrap.correct}
                  </div>
                  <div className="l1-trap-why">
                    <strong>Почему:</strong> {triggeredTrap.why}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}

function Chip({
  entity,
  state,
  ...rest
}: { entity: string; state?: 'ok' | 'bad' } & React.HTMLAttributes<HTMLDivElement> & {
    draggable?: boolean
  }) {
  return (
    <div className={`l1-chip${state ? ` is-${state}` : ''}`} {...rest}>
      {entity}
    </div>
  )
}
