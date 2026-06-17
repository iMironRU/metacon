import './App.css'

export default function App() {
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
          <a
            className="primary"
            href="https://github.com/iMironRU/metacon"
            target="_blank"
            rel="noreferrer"
          >
            Репозиторий на GitHub →
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
