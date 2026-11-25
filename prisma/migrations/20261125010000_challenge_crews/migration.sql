-- 72-Hour Challenge: public nicknames and crews (async teams)
ALTER TABLE "Player" ADD COLUMN "nickname" TEXT, ADD COLUMN "crewId" TEXT;

CREATE TABLE "Crew" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Crew_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Crew_code_key" ON "Crew"("code");
CREATE INDEX "Player_crewId_idx" ON "Player"("crewId");
CREATE INDEX "RoomAttempt_roomId_createdAt_idx" ON "RoomAttempt"("roomId", "createdAt");

ALTER TABLE "Player" ADD CONSTRAINT "Player_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE SET NULL ON UPDATE CASCADE;
