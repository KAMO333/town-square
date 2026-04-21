import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

describe("Database Connection", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should successfully connect to PostgreSQL", async () => {
    // This simple query checks if the DB is reachable
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    expect(result).toEqual([{ connected: 1 }]);
  });
});
