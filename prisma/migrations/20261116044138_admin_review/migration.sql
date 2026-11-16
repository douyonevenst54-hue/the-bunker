-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'player';

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "authorId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "selfApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSignoff" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSignoff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentRevision_contentId_status_idx" ON "ContentRevision"("contentId", "status");

-- CreateIndex
CREATE INDEX "ContentSignoff_contentId_createdAt_idx" ON "ContentSignoff"("contentId", "createdAt");

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSignoff" ADD CONSTRAINT "ContentSignoff_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
