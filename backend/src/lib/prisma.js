import { PrismaClient } from "@prisma/client";

// Ensure Prisma uses the library engine to avoid adapter/accelerate requirements
if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) {
    process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";
}

const prisma = new PrismaClient();

export default prisma;
