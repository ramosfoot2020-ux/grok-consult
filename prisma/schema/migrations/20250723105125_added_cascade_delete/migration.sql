-- DropForeignKey
ALTER TABLE "ParticipantsInMeeting" DROP CONSTRAINT "ParticipantsInMeeting_meetingNoteId_fkey";

-- AddForeignKey
ALTER TABLE "ParticipantsInMeeting" ADD CONSTRAINT "ParticipantsInMeeting_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
