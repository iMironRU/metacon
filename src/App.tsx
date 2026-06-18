import { useState } from 'react'
import { L1Widget } from '../ui/L1Widget'
import card from '../cards/operativny/partii_fifo_lifo.json'
import golden from '../cards/operativny/partii_fifo_lifo.golden.json'
import type { Golden } from './types/golden'
import type { Trap } from '../engine/contracts'
import './App.css'

type View = 'landing' | 'demo'

export default function App() {
  const [view, setView] = useState<View>('landing')

  if (view === 'demo') {
    const g = golden as Golden
    return (
      <main className="page">
        <header className="topbar">
          <button className="link-btn" onClick={() => setView('landing')}>
            ← На главную
          </button>
          <span className="topbar-title">
            МетаКон · демо · <code>{card.id}</code>
          </span>
        </header>
        <section className="page-body">
          <div className="task">
            <h1 className="task-title">Уровень 1 · классификация</h1>
            <p className="task-skill">{card.skill}</p>
            <div className="task-scaffold">
              {card.render?.scaffold_template ?? card.requires_context.join(' · ')}
            </div>
          </div>
          {g.level_1 ? (
            <L1Widget
              title="Разнесите сущности по видам объектов 1С"
              buckets={g.level_1.buckets}
              entities={g.level_1.entities}
              expected={g.level_1.expected}
              traps={card.traps as Trap[]}
            />
          ) : null}
        </section>
      </main>
    )
  }

  return (
    <main className="placeholder">
      <div className="card">
        <p className="badge">v0.1.0 · в разработке</p>
        <h1>МетаКон</h1>
        <p className="lead">
          Браузерный тренажёр на <strong>покрытие механизмов</strong> платформы
          1С:Предприятие 8.3 для подготовки к экзамену «1С:Специалист».
          Тренирует навык чтения и декомпозиции задачи, а не зубрёжку решений.
        </p>
        <p className="status">
          Сейчас идёт сборка MVP: регистр накопления, уровни 1–2,
          детерминированная проверка в браузере.
        </p>
        <nav className="links">
          <button className="primary" onClick={() => setView('demo')}>
            Демо: уровень 1 →
          </button>
          <a
            href="https://github.com/iMironRU/metacon"
            target="_blank"
            rel="noreferrer"
          >
            Репозиторий на GitHub
          </a>
          <a
            href="https://github.com/iMironRU/metacon/blob/main/docs/CONCEPT.md"
            target="_blank"
            rel="noreferrer"
          >
            Концепция
          </a>
          <a
            href="https://github.com/iMironRU/metacon/blob/main/docs/HANDOFF.md"
            target="_blank"
            rel="noreferrer"
          >
            HANDOFF
          </a>
        </nav>
      </div>
    </main>
  )
}
