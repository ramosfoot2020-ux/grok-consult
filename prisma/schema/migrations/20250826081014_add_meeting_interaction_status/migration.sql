-- CreateEnum
CREATE TYPE "MeetingInteractionStatus" AS ENUM ('PENDING', 'AI_GENERATED', 'MANUALLY_REVIEWED', 'IPMORTED_GOOGLE');

-- AlterTable
ALTER TABLE "MeetingNote" ADD COLUMN     "interactionStatus" "MeetingInteractionStatus" NOT NULL DEFAULT 'PENDING';
