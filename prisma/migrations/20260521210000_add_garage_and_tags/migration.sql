-- Drop owned column from Car
ALTER TABLE "Car" DROP COLUMN "owned";

-- Drop owned index
DROP INDEX IF EXISTS "Car_owned_idx";

-- CreateTable UserGarage
CREATE TABLE "UserGarage" (
    "id"      SERIAL NOT NULL,
    "carId"   INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes"   TEXT,

    CONSTRAINT "UserGarage_pkey" PRIMARY KEY ("id")
);

-- CreateTable CarTag
CREATE TABLE "CarTag" (
    "id"           SERIAL NOT NULL,
    "userGarageId" INTEGER NOT NULL,
    "tag"          TEXT NOT NULL,

    CONSTRAINT "CarTag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: UserGarage → Car
ALTER TABLE "UserGarage" ADD CONSTRAINT "UserGarage_carId_fkey"
    FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CarTag → UserGarage
ALTER TABLE "CarTag" ADD CONSTRAINT "CarTag_userGarageId_fkey"
    FOREIGN KEY ("userGarageId") REFERENCES "UserGarage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
