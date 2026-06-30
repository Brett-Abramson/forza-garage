-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "units" TEXT NOT NULL DEFAULT 'English',
    "powerUnits" TEXT NOT NULL DEFAULT 'hp',
    "springUnits" TEXT NOT NULL DEFAULT 'N/mm',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");
