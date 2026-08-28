-- CreateTable
CREATE TABLE "DeviationAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RESPONSIBLE',
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeviationAssignment_deviationId_fkey" FOREIGN KEY ("deviationId") REFERENCES "Deviation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeviationAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviationComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeviationComment_deviationId_fkey" FOREIGN KEY ("deviationId") REFERENCES "Deviation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeviationComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeviationComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DeviationComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailOnAssignment" BOOLEAN NOT NULL DEFAULT true,
    "emailOnComment" BOOLEAN NOT NULL DEFAULT true,
    "emailOnMention" BOOLEAN NOT NULL DEFAULT true,
    "emailOnStatusChange" BOOLEAN NOT NULL DEFAULT true,
    "emailOnDueDateApproaching" BOOLEAN NOT NULL DEFAULT true,
    "emailDigest" BOOLEAN NOT NULL DEFAULT false,
    "emailDigestFrequency" TEXT NOT NULL DEFAULT 'daily',
    CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DeviationAssignment_deviationId_idx" ON "DeviationAssignment"("deviationId");

-- CreateIndex
CREATE INDEX "DeviationAssignment_userId_idx" ON "DeviationAssignment"("userId");

-- CreateIndex
CREATE INDEX "DeviationAssignment_status_idx" ON "DeviationAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DeviationAssignment_deviationId_userId_role_key" ON "DeviationAssignment"("deviationId", "userId", "role");

-- CreateIndex
CREATE INDEX "DeviationComment_deviationId_idx" ON "DeviationComment"("deviationId");

-- CreateIndex
CREATE INDEX "DeviationComment_userId_idx" ON "DeviationComment"("userId");

-- CreateIndex
CREATE INDEX "DeviationComment_parentId_idx" ON "DeviationComment"("parentId");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_idx" ON "ActivityLog"("organizationId");

-- CreateIndex
CREATE INDEX "ActivityLog_projectId_idx" ON "ActivityLog"("projectId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "Deviation_status_idx" ON "Deviation"("status");
