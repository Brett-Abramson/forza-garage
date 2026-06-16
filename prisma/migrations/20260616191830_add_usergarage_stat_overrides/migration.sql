-- AlterTable
ALTER TABLE "UserGarage" ADD COLUMN     "displacementLOverride" DOUBLE PRECISION,
ADD COLUMN     "frontWeightOverride" INTEGER,
ADD COLUMN     "powerHpOverride" INTEGER,
ADD COLUMN     "rarityOverride" TEXT,
ADD COLUMN     "statAccelerationOverride" DOUBLE PRECISION,
ADD COLUMN     "statBrakingOverride" DOUBLE PRECISION,
ADD COLUMN     "statHandlingOverride" DOUBLE PRECISION,
ADD COLUMN     "statLaunchOverride" DOUBLE PRECISION,
ADD COLUMN     "statOffroadOverride" DOUBLE PRECISION,
ADD COLUMN     "statSpeedOverride" DOUBLE PRECISION,
ADD COLUMN     "torqueFtLbOverride" INTEGER,
ADD COLUMN     "weightLbOverride" INTEGER;
