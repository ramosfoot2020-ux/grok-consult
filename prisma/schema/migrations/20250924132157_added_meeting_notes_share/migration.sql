/*
  Warnings:

  - You are about to drop the column `notes` on the `MeetingNote` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `MeetingNote` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `MeetingNote` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `MeetingNote` table. All the data in the column will be lost.
  - You are about to drop the column `tickets` on the `MeetingNote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MeetingNote" DROP COLUMN "notes",
DROP COLUMN "severity",
DROP COLUMN "status",
DROP COLUMN "summary",
DROP COLUMN "tickets";

-- CreateTable
CREATE TABLE "MeetingNoteShare" (
    "meetingNoteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingNoteShare_pkey" PRIMARY KEY ("meetingNoteId","userId")
);

-- AddForeignKey
ALTER TABLE "MeetingNoteShare" ADD CONSTRAINT "MeetingNoteShare_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteShare" ADD CONSTRAINT "MeetingNoteShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
