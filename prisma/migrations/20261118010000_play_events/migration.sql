-- CreateTable
CREATE TABLE "PlayEvent" (
    "id" TEXT NOT NULL,
    "visitor" TEXT NOT NULL,
    "playerId" TEXT,
    "kind" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayEvent_contentId_kind_createdAt_idx" ON "PlayEvent"("contentId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "PlayEvent_visitor_createdAt_idx" ON "PlayEvent"("visitor", "createdAt");
