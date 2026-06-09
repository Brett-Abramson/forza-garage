-- CreateTable
CREATE TABLE "CarMeta" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "piClass" TEXT NOT NULL,
    "raceType" TEXT NOT NULL,
    "rank" INTEGER,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "source" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replacedAt" TIMESTAMP(3),

    CONSTRAINT "CarMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarMeta_carId_idx" ON "CarMeta"("carId");

-- CreateIndex
CREATE INDEX "CarMeta_piClass_idx" ON "CarMeta"("piClass");

-- CreateIndex
CREATE INDEX "CarMeta_raceType_idx" ON "CarMeta"("raceType");

-- CreateIndex
CREATE INDEX "CarMeta_recordedAt_idx" ON "CarMeta"("recordedAt");

-- CreateIndex
CREATE INDEX "CarMeta_active_piClass_raceType_idx" ON "CarMeta"("active", "piClass", "raceType");

-- AddForeignKey
ALTER TABLE "CarMeta" ADD CONSTRAINT "CarMeta_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
