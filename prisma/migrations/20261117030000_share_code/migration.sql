-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "shareCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Player_shareCode_key" ON "Player"("shareCode");
