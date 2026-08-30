import { deriveChildProfile } from "@/lib/derive/childProfile";

describe("deriveChildProfile", () => {
  it("derives a cautious specialist-led route from application answers", () => {
    const profile = deriveChildProfile({
      behavior: "HAS_ISSUES",
      behaviorNote: "Нуждается в поддержке при смене активности",
      food: ["SELECTIVE"],
      individualNote: "Три дня в неделю утром",
      previousExperience: "PRIVATE_LESSONS",
      speech: "DELAYED",
      toilet: "NEEDS_PROMPTING",
      visitFormat: "INDIVIDUAL",
    });

    expect(profile.behaviorNotes).toContain("смене активности");
    expect(profile.selfCare).toContain("Три дня в неделю утром");
    expect(profile.recommendedRoute).toContain("логопед-дефектолог");
    expect(profile.recommendedRoute).toContain("Точный маршрут определяет специалист");
  });
});
