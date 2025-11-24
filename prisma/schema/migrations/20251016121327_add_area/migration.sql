-- CreateEnum
CREATE TYPE "MeetingArea" AS ENUM ('SOFTWARE_DEVELOPMENT');

-- AlterTable
ALTER TABLE "MeetingNote" ADD COLUMN     "area" "MeetingArea";
