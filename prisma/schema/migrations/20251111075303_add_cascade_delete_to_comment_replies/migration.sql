-- DropForeignKey
ALTER TABLE "MeetingComment" DROP CONSTRAINT "MeetingComment_parentId_fkey";

-- AddForeignKey
ALTER TABLE "MeetingComment" ADD CONSTRAINT "MeetingComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MeetingComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
