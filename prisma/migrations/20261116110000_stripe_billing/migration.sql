-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subInterval" TEXT,
ADD COLUMN     "subPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "subStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Player_stripeCustomerId_key" ON "Player"("stripeCustomerId");
