-- CreateTable
CREATE TABLE "MeetingComment"
(
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meetingNoteId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "from" INTEGER,
    "to" INTEGER,

    CONSTRAINT "MeetingComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MeetingComment" ADD CONSTRAINT "MeetingComment_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingComment" ADD CONSTRAINT "MeetingComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id")
ON DELETE RESTRICT ON
UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingComment" ADD CONSTRAINT "MeetingComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MeetingComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
