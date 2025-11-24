/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeetingNote" DROP CONSTRAINT "MeetingNote_locationId_fkey";

-- AlterTable
ALTER TABLE "MeetingNote" ADD COLUMN     "location" TEXT;

-- DropTable
DROP TABLE "Location";

-- DropEnum
DROP TYPE "LocationTypes";
