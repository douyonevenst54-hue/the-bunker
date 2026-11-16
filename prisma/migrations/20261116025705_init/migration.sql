-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomAttempt" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "criticalErrors" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomProgress" (
    "playerId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bestScore" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "attempts" INTEGER NOT NULL,
    "lastPlayedAt" TIMESTAMP(3) NOT NULL,
    "passedAt" TIMESTAMP(3),

    CONSTRAINT "RoomProgress_pkey" PRIMARY KEY ("playerId","roomId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE INDEX "RoomAttempt_playerId_roomId_idx" ON "RoomAttempt"("playerId", "roomId");

-- AddForeignKey
ALTER TABLE "RoomAttempt" ADD CONSTRAINT "RoomAttempt_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomProgress" ADD CONSTRAINT "RoomProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
