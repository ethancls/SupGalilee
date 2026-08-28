-- AlterTable
ALTER TABLE "Node" ADD COLUMN "color" TEXT;
ALTER TABLE "Node" ADD COLUMN "nodeType" TEXT;

-- CreateTable
CREATE TABLE "AISettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'OPENAI',
    "apiKey" TEXT,
    "model" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AISettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NodeConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NodeConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Node" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NodeConnection_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Node" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AISettings_organizationId_key" ON "AISettings"("organizationId");

-- CreateIndex
CREATE INDEX "NodeConnection_sourceId_idx" ON "NodeConnection"("sourceId");

-- CreateIndex
CREATE INDEX "NodeConnection_targetId_idx" ON "NodeConnection"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "NodeConnection_sourceId_targetId_key" ON "NodeConnection"("sourceId", "targetId");
