import { buildNewApplicationTelegramMessage } from "@/lib/telegram-message";

describe("new application Telegram message", () => {
  it("contains only a technical application reference", () => {
    const message = buildNewApplicationTelegramMessage("cmf1n8y4u0001l9f7k9dx1234");

    expect(message).toContain("cmf1n8y4u0001l9f7k9dx1234");
    expect(message).not.toMatch(/телефон|родител|ребёнок|речь|поведени/i);
  });
});
