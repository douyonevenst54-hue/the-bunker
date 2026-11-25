-- Pi rewarded ads: Room 3 for 24 hours, once a day, each ad id used once
ALTER TABLE "Player" ADD COLUMN "adRoomUntil" TIMESTAMP(3);

CREATE TABLE "AdReward" (
    "adId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdReward_pkey" PRIMARY KEY ("adId")
);

CREATE INDEX "AdReward_playerId_createdAt_idx" ON "AdReward"("playerId", "createdAt");
