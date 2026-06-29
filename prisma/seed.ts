import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Пользователи админки ---
  const adminLogin = process.env.SEED_ADMIN_LOGIN ?? "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "change-me-strong";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Администратор";
  const passwordHash = await hash(adminPassword);

  await prisma.adminUser.upsert({
    where: { login: adminLogin },
    update: {},
    create: {
      name: adminName,
      login: adminLogin,
      passwordHash,
      role: "ADMIN",
      active: true,
      canViewApplications: true,
      canViewResponses: true,
    },
  });

  await prisma.adminUser.upsert({
    where: { login: "content" },
    update: {},
    create: {
      name: "Контент-менеджер",
      login: "content",
      passwordHash: await hash("change-me-content"),
      role: "CONTENT_MANAGER",
      active: true,
    },
  });

  // --- Настройки сайта (singleton) ---
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      data: {
        hero: {
          title: "Детский сад для особенных детей",
          subtitle: "Комплексное психолого-педагогическое сопровождение на протяжении всего дня",
          imageAlt: "Ребёнок на развивающем занятии в детском саду «РАСтишка»",
        },
        audience: [
          { key: "ras", title: "РАС", description: "Индивидуальный маршрут, ABA-подход, тьютор, сенсорная интеграция, логопед-дефектолог." },
          { key: "zprr", title: "ЗПРР и ЗРР", description: "Логопед-дефектолог, логоритмика, игровые занятия, рекомендации родителям." },
          { key: "adhd", title: "СДВГ", description: "Структурированный режим, поведенческие стратегии, психолог, АФК." },
          { key: "down", title: "Синдром Дауна", description: "Индивидуальная программа, развитие речи, бытовых и социальных навыков." },
        ],
        phone: "+996 502 114 888",
        socials: {
          instagram: "https://instagram.com/rastishka",
          facebook: "https://facebook.com/rastishka",
          threads: "https://www.threads.net/@rastishka",
        },
        branches: [
          { title: "Главный филиал", address: "г. Бишкек", lat: 42.8746, lng: 74.5698 },
        ],
      },
    },
  });

  // --- Конфигурация уведомлений (singleton) ---
  await prisma.notificationConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      telegramEnabled: true,
      whatsappEnabled: false,
      emailEnabled: false,
      emailRecipients: [],
    },
  });

  // --- Демоконтент (только не в production) ---
  if (process.env.NODE_ENV !== "production") {
    const adminUser = await prisma.adminUser.findUnique({ where: { login: adminLogin } });

    const news = [
      {
        slug: "prazdnichnyy-tvorcheskiy-den",
        title: "Праздничный творческий день в РАСтишке",
        shortText: "Яркие краски, улыбки и море вдохновения! Наши ребята создавали свои шедевры.",
        fullText:
          "Яркие краски, улыбки и море вдохновения! Наши ребята создавали свои шедевры, играли и отмечали начало лета вместе. День прошёл в тёплой и поддерживающей атмосфере.",
        alt: "Дети рисуют на творческом занятии",
      },
      {
        slug: "novaya-sensornaya-zona",
        title: "Новая сенсорная зона",
        shortText: "Больше тактильных материалов и спокойного пространства для адаптации.",
        fullText:
          "Мы обновили сенсорную зону: добавили тактильные материалы и спокойное пространство для мягкой адаптации детей с сенсорными особенностями.",
        alt: "Сенсорная зона в детском саду",
      },
      {
        slug: "letnie-razvivayushchie-zanyatiya",
        title: "Летние развивающие занятия",
        shortText: "Тёплые игры и занятия на свежем воздухе для развития навыков общения.",
        fullText:
          "Летом мы делаем акцент на игры и занятия на свежем воздухе — это помогает развивать навыки общения, моторику и самостоятельность.",
        alt: "Летние занятия на свежем воздухе",
      },
    ];

    let offsetDays = 0;
    for (const n of news) {
      const date = new Date("2026-06-12T10:00:00.000Z");
      date.setDate(date.getDate() - offsetDays * 7);
      offsetDays += 1;
      await prisma.news.upsert({
        where: { slug: n.slug },
        update: {},
        create: {
          ...n,
          date,
          status: "PUBLISHED",
          publishedAt: date,
          authorId: adminUser?.id ?? null,
        },
      });
    }

    const vacancies = [
      {
        slug: "logoped-defektolog",
        title: "Логопед-дефектолог",
        preview: "Помощь детям в развитии речи и коммуникативных навыков.",
        duties: "Проведение индивидуальных и групповых занятий; диагностика речевого развития; составление и реализация коррекционных карт.",
        requirements: "Профильное образование; опыт работы от 1 года; знание методик; терпение и эмпатия.",
        offer: "Дружелюбная команда; профессиональное развитие; гибкий график; конкурентная оплата.",
        sortOrder: 1,
      },
      {
        slug: "psiholog",
        title: "Психолог",
        preview: "Поддержка детей и родителей, работа в команде специалистов.",
        duties: "Психологическая диагностика; поддержка адаптации; работа с родителями.",
        requirements: "Профильное образование; опыт работы с особенными детьми.",
        offer: "Поддерживающая среда; супервизии; развитие.",
        sortOrder: 2,
      },
      {
        slug: "afk-instruktor",
        title: "АФК-инструктор",
        preview: "Адаптивная физкультура для развития моторики и координации.",
        duties: "Проведение занятий по адаптивной физкультуре; индивидуальный подход.",
        requirements: "Образование в сфере АФК; опыт работы с детьми.",
        offer: "Гибкий график; дружная команда.",
        sortOrder: 3,
      },
    ];

    for (const v of vacancies) {
      await prisma.vacancy.upsert({
        where: { slug: v.slug },
        update: {},
        create: { ...v, status: "PUBLISHED", publishedAt: new Date() },
      });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
