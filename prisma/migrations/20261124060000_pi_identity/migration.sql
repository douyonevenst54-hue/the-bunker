-- AlterTable
ALTER TABLE "Player" ADD COLUMN "piUid" TEXT,
ADD COLUMN "piUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Player_piUid_key" ON "Player"("piUid");

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "piSupporterAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PiPayment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "playerId" TEXT,
    "piUid" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "txid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PiPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PiPayment_paymentId_key" ON "PiPayment"("paymentId");

-- CreateIndex
CREATE INDEX "PiPayment_playerId_idx" ON "PiPayment"("playerId");

-- AddForeignKey
ALTER TABLE "PiPayment" ADD CONSTRAINT "PiPayment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
