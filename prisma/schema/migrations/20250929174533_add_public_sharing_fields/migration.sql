/*
  Warnings:

  - A unique constraint covering the columns `[publicSlug]` on the table `MeetingNote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MeetingNote" ADD COLUMN     "publicSlug" TEXT,
ADD COLUMN     "publicUntil" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingNote_publicSlug_key" ON "MeetingNote"("publicSlug");
