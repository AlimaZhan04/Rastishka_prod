/**
 * Единый источник enum-ов анкеты и их русских формулировок.
 * Используется в UI анкеты, админ-карточках, шаблонах уведомлений и деривации профиля.
 * Формулировки бережные (поддержка/сопровождение/адаптация), без медицинских гарантий.
 */
import {
  VisitFormat,
  SpeechLevel,
  BehaviorState,
  ToiletLevel,
  FoodSkill,
  PrevExperience,
} from "@/generated/prisma/enums";

export {
  VisitFormat,
  SpeechLevel,
  BehaviorState,
  ToiletLevel,
  FoodSkill,
  PrevExperience,
};

export type Option<T extends string> = { value: T; label: string };

/** Варианты посещения (карточки на главной + шаг 1 анкеты). */
export const VISIT_FORMATS: { value: VisitFormat; title: string; hours?: string }[] = [
  { value: "FULL_DAY", title: "Группа полного дня", hours: "8:00–19:00" },
  { value: "MORNING", title: "Группа утро", hours: "8:00–13:00" },
  { value: "LUNCH", title: "Группа обед", hours: "14:00–19:00" },
  { value: "INDIVIDUAL", title: "Индивидуальный график" },
];

export const VISIT_FORMAT_LABELS: Record<VisitFormat, string> = {
  FULL_DAY: "Группа полного дня 8:00–19:00",
  MORNING: "Группа утро 8:00–13:00",
  LUNCH: "Группа обед 14:00–19:00",
  INDIVIDUAL: "Индивидуальный график",
};

/** Шаг 2 — развитие речи. */
export const SPEECH_OPTIONS: Option<SpeechLevel>[] = [
  { value: "AGE_APPROPRIATE", label: "Развита по возрасту" },
  { value: "DELAYED", label: "Есть задержка речевого развития" },
  { value: "NON_VERBAL", label: "Ребёнок не говорит" },
];

/** Шаг 3 — особенности поведения. */
export const BEHAVIOR_OPTIONS: Option<BehaviorState>[] = [
  { value: "NO_ISSUES", label: "Нет проблем поведения" },
  { value: "HAS_ISSUES", label: "Есть особенности — опишу, что беспокоит" },
];

/** Шаг 4 — навыки туалета. */
export const TOILET_OPTIONS: Option<ToiletLevel>[] = [
  { value: "TRAINED", label: "Приучен и сообщает" },
  { value: "NEEDS_PROMPTING", label: "Нужно высаживать" },
  { value: "NOT_TRAINED", label: "Не приучен / памперс" },
];

/** Шаг 5 — навыки питания (мультивыбор). */
export const FOOD_OPTIONS: Option<FoodSkill>[] = [
  { value: "INDEPENDENT", label: "Ест самостоятельно" },
  { value: "NO_UTENSILS", label: "Ест без приборов" },
  { value: "SELECTIVE", label: "Пищевая избирательность" },
  { value: "NO_SOLIDS", label: "Не жуёт твёрдую пищу / детское питание" },
];

/** Шаг 6 — предыдущий опыт занятий. */
export const EXPERIENCE_OPTIONS: Option<PrevExperience>[] = [
  { value: "KINDERGARTEN", label: "Ходили в детский сад" },
  { value: "PRIVATE_LESSONS", label: "Частные занятия" },
  { value: "NONE", label: "Никуда не ходили" },
];

/** Утилита: построить Record<value,label> из массива опций. */
function toLabelMap<T extends string>(opts: Option<T>[]): Record<T, string> {
  return Object.fromEntries(opts.map((o) => [o.value, o.label])) as Record<T, string>;
}

export const SPEECH_LABELS = toLabelMap(SPEECH_OPTIONS);
export const BEHAVIOR_LABELS = toLabelMap(BEHAVIOR_OPTIONS);
export const TOILET_LABELS = toLabelMap(TOILET_OPTIONS);
export const FOOD_LABELS = toLabelMap(FOOD_OPTIONS);
export const EXPERIENCE_LABELS = toLabelMap(EXPERIENCE_OPTIONS);

export const VISIT_FORMAT_VALUES = VISIT_FORMATS.map((f) => f.value) as [
  VisitFormat,
  ...VisitFormat[],
];
export const SPEECH_VALUES = SPEECH_OPTIONS.map((o) => o.value) as [SpeechLevel, ...SpeechLevel[]];
export const BEHAVIOR_VALUES = BEHAVIOR_OPTIONS.map((o) => o.value) as [
  BehaviorState,
  ...BehaviorState[],
];
export const TOILET_VALUES = TOILET_OPTIONS.map((o) => o.value) as [ToiletLevel, ...ToiletLevel[]];
export const FOOD_VALUES = FOOD_OPTIONS.map((o) => o.value) as [FoodSkill, ...FoodSkill[]];
export const EXPERIENCE_VALUES = EXPERIENCE_OPTIONS.map((o) => o.value) as [
  PrevExperience,
  ...PrevExperience[],
];
