-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "raceName" TEXT NOT NULL,
    "raceType" TEXT NOT NULL,
    "distanceMi" DOUBLE PRECISION,
    "laps" INTEGER,
    "region" TEXT,
    "trackImageUrl" TEXT,
    "detailsImageUrl" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackProfile" (
    "id" SERIAL NOT NULL,
    "trackId" INTEGER NOT NULL,
    "elevationDeltaFt" DOUBLE PRECISION,
    "elevationMinFt" DOUBLE PRECISION,
    "elevationMaxFt" DOUBLE PRECISION,
    "avgLateralG" DOUBLE PRECISION,
    "maxLateralG" DOUBLE PRECISION,
    "brakeZoneCount" INTEGER,
    "cornerCount" INTEGER,
    "sampleLapCount" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL,
    "qualityChecked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackCorner" (
    "id" SERIAL NOT NULL,
    "trackId" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "label" TEXT,
    "distanceIntoLapFt" DOUBLE PRECISION,
    "minSpeedMph" DOUBLE PRECISION,
    "maxLateralG" DOUBLE PRECISION,
    "brakingZone" BOOLEAN NOT NULL DEFAULT false,
    "throttleOnExit" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackCorner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Track_raceType_idx" ON "Track"("raceType");

-- CreateIndex
CREATE INDEX "Track_region_idx" ON "Track"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Track_raceName_key" ON "Track"("raceName");

-- CreateIndex
CREATE UNIQUE INDEX "TrackProfile_trackId_key" ON "TrackProfile"("trackId");

-- CreateIndex
CREATE INDEX "TrackCorner_trackId_idx" ON "TrackCorner"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackCorner_trackId_sequence_key" ON "TrackCorner"("trackId", "sequence");

-- AddForeignKey
ALTER TABLE "TrackProfile" ADD CONSTRAINT "TrackProfile_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCorner" ADD CONSTRAINT "TrackCorner_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
