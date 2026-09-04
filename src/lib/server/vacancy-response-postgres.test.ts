import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { saveVacancyResponse, VacancyUnavailableError } from "./vacancy-response-repository";

jest.mock("server-only", () => ({}));
jest.mock("@/lib/db", () => ({
  get prisma() {
    return mockDatabase;
  },
}));

let mockDatabase: PrismaClient;
const integration = process.env.RUN_POSTGRES_INTEGRATION === "1" ? describe : describe.skip;

// All writes are confined to a fresh, randomly named schema on loopback only.
integration("vacancy responses with real PostgreSQL", () => {
  const schema = `resume_test_${randomUUID().replaceAll("-", "")}`;
  let setup: Client;
  let createdSchema = false;
  let vacancyId: string;

  function migration(name: string): string {
    return readFileSync(
      join(process.cwd(), "prisma/migrations", name, "migration.sql"),
      "utf8",
    ).replace('CREATE SCHEMA IF NOT EXISTS "public";', "");
  }

  beforeAll(async () => {
    const connectionString = process.env.POSTGRES_TEST_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("A local PostgreSQL connection is required");
    const url = new URL(connectionString);
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.searchParams.has("host") ||
      url.searchParams.has("hostaddr")
    ) {
      throw new Error("Integration tests accept only loopback PostgreSQL URLs");
    }
    if (!/^resume_test_[a-f0-9]{32}$/.test(schema)) throw new Error("Unsafe test schema");
    setup = new Client({ connectionString });
    await setup.connect();
    await setup.query(`CREATE SCHEMA "${schema}"`);
    createdSchema = true;
    await setup.query(`SET search_path TO "${schema}"`);
    await setup.query(migration("20260830170000_init"));
    await setup.query(migration("20260902193000_add_vacancy_response_consent"));

    // A legacy reference must block migration without removing the original row.
    await setup.query(`INSERT INTO "Vacancy" (id, title, preview, duties, requirements, offer, slug, "updatedAt")
      VALUES ('legacy-vacancy', 'Synthetic', 'Synthetic', 'Synthetic', 'Synthetic', 'Synthetic', 'synthetic-legacy', NOW())`);
    await setup.query(`INSERT INTO "VacancyResponse" (id, "vacancyId", name, phone, "resumeFilePath", "submissionHash", "updatedAt")
      VALUES ('legacy-response', 'legacy-vacancy', 'Synthetic', '+996555000000', 'old/external.pdf', 'synthetic-legacy', NOW())`);
    await expect(
      setup.query(migration("20260904090000_store_resumes_in_postgres")),
    ).rejects.toThrow("External resume references exist");
    await setup.query("ROLLBACK");
    expect(
      (
        await setup.query('SELECT "resumeFilePath" FROM "VacancyResponse" WHERE id = $1', [
          "legacy-response",
        ])
      ).rows,
    ).toEqual([{ resumeFilePath: "old/external.pdf" }]);
    await setup.query('DELETE FROM "Vacancy" WHERE id = $1', ["legacy-vacancy"]);
    await setup.query(migration("20260904090000_store_resumes_in_postgres"));
    mockDatabase = new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema }) });
    await mockDatabase.$connect();
  }, 30000);

  beforeEach(async () => {
    const vacancy = await mockDatabase.vacancy.create({
      data: {
        title: "Synthetic integration test",
        preview: "Synthetic",
        duties: "Synthetic",
        requirements: "Synthetic",
        offer: "Synthetic",
        slug: randomUUID(),
        status: "PUBLISHED",
      },
    });
    vacancyId = vacancy.id;
  });

  afterAll(async () => {
    try {
      await mockDatabase?.$disconnect();
      if (createdSchema && /^resume_test_[a-f0-9]{32}$/.test(schema)) {
        await setup.query("ROLLBACK");
        await setup.query(`DROP SCHEMA "${schema}" CASCADE`);
        await setup.query("SET search_path TO public");
      }
    } finally {
      await setup?.end();
    }
  });

  function input() {
    const content = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55, 0, 128, 255]);
    return {
      vacancyId,
      name: "Synthetic Candidate",
      phone: "+996555000000",
      consent: true as const,
      resume: {
        key: randomUUID(),
        fileName: "Резюме.pdf",
        mimeType: "application/pdf" as const,
        size: content.length,
        content,
      },
    };
  }

  async function counts() {
    return {
      responses: await mockDatabase.vacancyResponse.count({ where: { vacancyId } }),
      files: await mockDatabase.resumeFile.count({ where: { vacancyResponse: { vacancyId } } }),
      counter: (await mockDatabase.vacancy.findUniqueOrThrow({ where: { id: vacancyId } }))
        .responsesCount,
    };
  }

  it("persists exact bytea content, metadata and consent together", async () => {
    const data = input();
    const saved = await saveVacancyResponse(data, randomUUID());
    const response = await mockDatabase.vacancyResponse.findUniqueOrThrow({
      where: { id: saved.vacancyResponseId },
      include: { resumeFile: true },
    });
    expect(saved.created).toBe(true);
    expect(response.resumeFile?.content).toEqual(data.resume.content);
    expect(response.resumeFile?.fileName).toBe(data.resume.fileName);
    expect(response.resumeFilePath).toBe(data.resume.key);
    expect(response.consentGiven).toBe(true);
    expect(await counts()).toEqual({ responses: 1, files: 1, counter: 1 });
  });

  it("accepts text-only responses without creating a file", async () => {
    await saveVacancyResponse(
      { ...input(), resume: undefined, experienceText: "Synthetic experience" },
      randomUUID(),
    );
    expect(await counts()).toEqual({ responses: 1, files: 0, counter: 1 });
  });

  it("persists a file exactly at the 10 MiB limit", async () => {
    const data = input();
    data.resume.content = new Uint8Array(10 * 1024 * 1024).fill(80);
    data.resume.size = data.resume.content.byteLength;
    const saved = await saveVacancyResponse(data, randomUUID());
    const file = await mockDatabase.resumeFile.findUniqueOrThrow({
      where: { vacancyResponseId: saved.vacancyResponseId },
    });
    expect(createHash("sha256").update(file.content).digest("hex")).toBe(
      createHash("sha256").update(data.resume.content).digest("hex"),
    );
    expect(await counts()).toEqual({ responses: 1, files: 1, counter: 1 });
  }, 30000);

  it("does not duplicate files or counters on a repeated submission", async () => {
    const key = randomUUID();
    const first = await saveVacancyResponse(input(), key);
    expect(await saveVacancyResponse(input(), key)).toEqual({ ...first, created: false });
    expect(await counts()).toEqual({ responses: 1, files: 1, counter: 1 });
  });

  it("handles concurrent duplicate submissions atomically", async () => {
    const key = randomUUID();
    const results = await Promise.all([
      saveVacancyResponse(input(), key),
      saveVacancyResponse(input(), key),
    ]);
    expect(results.filter((result) => result.created)).toHaveLength(1);
    expect(results[0].vacancyResponseId).toBe(results[1].vacancyResponseId);
    expect(await counts()).toEqual({ responses: 1, files: 1, counter: 1 });
  });

  it.each(["size", "mime"])(
    "rolls back response and counter when the %s file constraint fails",
    async (constraint) => {
      const data = input();
      if (constraint === "size") data.resume.size += 1;
      else Object.assign(data.resume, { mimeType: "text/html" });
      await expect(saveVacancyResponse(data, randomUUID())).rejects.toThrow();
      expect(await counts()).toEqual({ responses: 0, files: 0, counter: 0 });
    },
  );

  it("refuses a closed vacancy without persisting any part of a response", async () => {
    await mockDatabase.vacancy.update({ where: { id: vacancyId }, data: { status: "ARCHIVED" } });
    await expect(saveVacancyResponse(input(), randomUUID())).rejects.toBeInstanceOf(
      VacancyUnavailableError,
    );
    expect(await counts()).toEqual({ responses: 0, files: 0, counter: 0 });
  });

  it("cascades file deletion when a synthetic response is physically deleted", async () => {
    const data = input();
    const saved = await saveVacancyResponse(data, randomUUID());
    await mockDatabase.vacancyResponse.delete({ where: { id: saved.vacancyResponseId } });
    expect(await mockDatabase.resumeFile.findUnique({ where: { id: data.resume.key } })).toBeNull();
  });
});
