/*
  Warnings:

  - You are about to drop the column `participantsOutSystem` on the `MeetingNote` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BlocksTypes" ADD VALUE 'HEADING';
ALTER TYPE "BlocksTypes" ADD VALUE 'PARAGRAPH';
ALTER TYPE "BlocksTypes" ADD VALUE 'TASK_LIST';
ALTER TYPE "BlocksTypes" ADD VALUE 'BULLET_LIST';
ALTER TYPE "BlocksTypes" ADD VALUE 'ORDERED_LIST';
ALTER TYPE "BlocksTypes" ADD VALUE 'HORIZONTAL_RULE';

-- AlterTable
ALTER TABLE "MeetingNote" DROP COLUMN "participantsOutSystem";

-- AlterTable
ALTER TABLE "ParticipantsInMeeting" ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT';

-- CreateTable
CREATE TABLE "ExternalParticipantsInMeeting" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "meetingNoteId" TEXT NOT NULL,

    CONSTRAINT "ExternalParticipantsInMeeting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExternalParticipantsInMeeting" ADD CONSTRAINT "ExternalParticipantsInMeeting_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
