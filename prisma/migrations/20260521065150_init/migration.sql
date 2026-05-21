-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "division" TEXT NOT NULL,
    "piClass" TEXT NOT NULL,
    "piRating" INTEGER NOT NULL,
    "drivetrain" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "engineCC" INTEGER NOT NULL,
    "cylinders" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "bodyStyle" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'Common',
    "owned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Car_make_idx" ON "Car"("make");

-- CreateIndex
CREATE INDEX "Car_division_idx" ON "Car"("division");

-- CreateIndex
CREATE INDEX "Car_piClass_idx" ON "Car"("piClass");

-- CreateIndex
CREATE INDEX "Car_owned_idx" ON "Car"("owned");
