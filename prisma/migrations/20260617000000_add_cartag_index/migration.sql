-- CreateIndex
-- Every tag read (UserGarage include) and tag edit (deleteMany by userGarageId)
-- filters on this foreign key, which previously had no supporting index.
CREATE INDEX "CarTag_userGarageId_idx" ON "CarTag"("userGarageId");
