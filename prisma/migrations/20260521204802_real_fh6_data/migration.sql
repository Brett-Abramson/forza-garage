/*
  Warnings:

  - You are about to drop the column `rarity` on the `Car` table. All the data in the column will be lost.
  - Added the required column `source` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Car" DROP COLUMN "rarity",
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "sourceInfo" TEXT,
ALTER COLUMN "drivetrain" DROP NOT NULL,
ALTER COLUMN "engineType" DROP NOT NULL,
ALTER COLUMN "engineCC" DROP NOT NULL,
ALTER COLUMN "cylinders" DROP NOT NULL,
ALTER COLUMN "bodyStyle" DROP NOT NULL;
