// МетаКон — контракты движка проверки.
// Типы ДАННЫХ карточки генерируются из schema/mechanism-card.schema.json
// (npx json-schema-to-typescript), здесь — только контракты ЧЕКЕРОВ.
// Инвариант: чекер — чистая функция (карточка/проекция, ответ) -> вердикт.

export type Verdict = "pass" | "fail";

export interface GradeResult {
  verdict: Verdict;
  /** какие пункты не совпали (для фидбэка) */
  mismatches: string[];
  /** какая ловушка сработала, если применимо (id/текст из card.traps) */
  trap?: string;
}

/** Уровень 1: классификация сущностей по корзинам. grade = точное_множество. */
export type L1Answer = Record<string /*entity*/, string /*bucket*/>;
export type L1Checker = (expected: L1Answer, answer: L1Answer, traps: Trap[]) => GradeResult;

/** Уровень 2: структура объекта. grade = обязательное_ядро (лишнее терпим). */
export interface L2Core { dimensions: string[]; resources: string[]; }
export interface L2Answer { dimensions: string[]; resources: string[]; attributes?: string[]; }
export type L2Checker = (core: L2Core, answer: L2Answer) => GradeResult;

export interface Trap { lure: string; correct: string; why: string; }

// Уровень 3 (вне MVP): movement-spec diff + AST через BSLexicon + поведение через симулятор.
