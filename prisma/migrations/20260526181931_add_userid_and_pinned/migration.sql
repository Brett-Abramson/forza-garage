-- AlterTable: add userId and pinned to UserGarage
-- userId is non-nullable; existing rows (if any) get a placeholder that must be cleaned up.
ALTER TABLE "UserGarage" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserGarage" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';

-- Strip the temporary default so new rows must supply a real userId
ALTER TABLE "UserGarage" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable: add onDelete Cascade to CarTag foreign key
ALTER TABLE "CarTag" DROP CONSTRAINT "CarTag_userGarageId_fkey";
ALTER TABLE "CarTag" ADD CONSTRAINT "CarTag_userGarageId_fkey"
  FOREIGN KEY ("userGarageId") REFERENCES "UserGarage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "UserGarage_userId_idx" ON "UserGarage"("userId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "UserGarage_userId_carId_key" ON "UserGarage"("userId", "carId");
