import type {
  VisitFormat,
  SpeechLevel,
  BehaviorState,
  ToiletLevel,
  FoodSkill,
  PrevExperience,
} from "@/lib/enums";

/**
 * Детерминированная деривация человекочитаемого «профиля ребёнка» из ответов анкеты
 * (FR-APP-12, FR-ADM-04). Формулировки бережные; recommendedRoute всегда отсылает
 * к специалисту и не содержит медицинских гарантий (этика ТЗ §3).
 */

export type DeriveInput = {
  visitFormat: VisitFormat;
  individualNote?: string | null;
  speech: SpeechLevel;
  behavior: BehaviorState;
  behaviorNote?: string | null;
  toilet: ToiletLevel;
  food: FoodSkill[];
  previousExperience: PrevExperience;
};

export type ChildProfileDraft = {
  speechLevelText: string;
  behaviorNotes: string;
  selfCare: string;
  foodNotes: string;
  adaptationExperience: string;
  recommendedRoute: string;
};

const SPEECH_TEXT: Record<SpeechLevel, string> = {
  AGE_APPROPRIATE: "Речь развита по возрасту.",
  DELAYED: "Есть задержка речевого развития.",
  NON_VERBAL: "Ребёнок не говорит (невербален). Рекомендуется логопед-дефектолог.",
};

const TOILET_TEXT: Record<ToiletLevel, string> = {
  TRAINED: "Приучен к туалету и сообщает о потребности.",
  NEEDS_PROMPTING: "Нужно высаживать / напоминать.",
  NOT_TRAINED: "Не приучен, используется памперс. Нужна поддержка навыков самостоятельности.",
};

const FOOD_TEXT: Record<FoodSkill, string> = {
  INDEPENDENT: "ест самостоятельно",
  NO_UTENSILS: "ест без столовых приборов",
  SELECTIVE: "пищевая избирательность",
  NO_SOLIDS: "не жуёт твёрдую пищу / детское питание",
};

const EXPERIENCE_TEXT: Record<PrevExperience, string> = {
  KINDERGARTEN: "Есть опыт посещения детского сада — адаптация может пройти легче.",
  PRIVATE_LESSONS: "Были частные занятия со специалистами.",
  NONE: "Ранее организованных занятий не было — потребуется мягкая адаптация.",
};

export function deriveChildProfile(app: DeriveInput): ChildProfileDraft {
  const speechLevelText = SPEECH_TEXT[app.speech];

  const behaviorNotes =
    app.behavior === "HAS_ISSUES"
      ? `Отмечены особенности поведения. Со слов родителя: «${app.behaviorNote?.trim() || "—"}».`
      : "Выраженных проблем поведения родитель не отмечает.";

  let selfCare = TOILET_TEXT[app.toilet];
  if (app.visitFormat === "INDIVIDUAL" && app.individualNote?.trim()) {
    selfCare += ` Пожелания по графику: «${app.individualNote.trim()}».`;
  }

  const foodNotes = app.food.length
    ? `Навыки питания: ${app.food.map((f) => FOOD_TEXT[f]).join(", ")}.`
    : "Навыки питания не указаны.";

  const adaptationExperience = EXPERIENCE_TEXT[app.previousExperience];

  const route: string[] = [];
  if (app.speech !== "AGE_APPROPRIATE") route.push("логопед-дефектолог");
  if (app.behavior === "HAS_ISSUES") route.push("психолог, поведенческие стратегии");
  if (app.food.includes("SELECTIVE") || app.food.includes("NO_SOLIDS")) {
    route.push("работа с пищевым поведением");
  }
  if (app.toilet !== "TRAINED") route.push("бытовые навыки и самостоятельность");

  const recommendedRoute = route.length
    ? `Возможные направления сопровождения: ${route.join("; ")}. Точный маршрут определяет специалист после диагностики.`
    : "Базовое сопровождение; точный маршрут определяет специалист после диагностики.";

  return {
    speechLevelText,
    behaviorNotes,
    selfCare,
    foodNotes,
    adaptationExperience,
    recommendedRoute,
  };
}
