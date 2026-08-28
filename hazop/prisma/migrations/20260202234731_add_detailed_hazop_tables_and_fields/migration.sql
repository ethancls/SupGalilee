-- AlterTable
ALTER TABLE "Node" ADD COLUMN "equipment" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "processDescription" TEXT;

-- CreateTable
CREATE TABLE "DeviationCause" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeviationCause_deviationId_fkey" FOREIGN KEY ("deviationId") REFERENCES "Deviation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviationConsequence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "severity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeviationConsequence_deviationId_fkey" FOREIGN KEY ("deviationId") REFERENCES "Deviation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviationSafeguard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT,
    "effectiveness" TEXT,
    "existing" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeviationSafeguard_deviationId_fkey" FOREIGN KEY ("deviationId") REFERENCES "Deviation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviationRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT,
    "priority" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeviationRecommendation_deviationId_fkey" FOREIGN KEY ("deviationId") REFERENCES "Deviation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DeviationCause_deviationId_idx" ON "DeviationCause"("deviationId");

-- CreateIndex
CREATE INDEX "DeviationConsequence_deviationId_idx" ON "DeviationConsequence"("deviationId");

-- CreateIndex
CREATE INDEX "DeviationSafeguard_deviationId_idx" ON "DeviationSafeguard"("deviationId");

-- CreateIndex
CREATE INDEX "DeviationRecommendation_deviationId_idx" ON "DeviationRecommendation"("deviationId");
