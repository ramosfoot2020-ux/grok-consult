/*
  Warnings:

  - The values [IPMORTED_GOOGLE] on the enum `MeetingInteractionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MeetingInteractionStatus_new" AS ENUM ('PENDING', 'AI_GENERATED', 'MANUALLY_REVIEWED', 'IMPORTED_GOOGLE');
ALTER TABLE "MeetingNote" ALTER COLUMN "interactionStatus" DROP DEFAULT;
ALTER TABLE "MeetingNote" ALTER COLUMN "interactionStatus" TYPE "MeetingInteractionStatus_new" USING ("interactionStatus"::text::"MeetingInteractionStatus_new");
ALTER TYPE "MeetingInteractionStatus" RENAME TO "MeetingInteractionStatus_old";
ALTER TYPE "MeetingInteractionStatus_new" RENAME TO "MeetingInteractionStatus";
DROP TYPE "MeetingInteractionStatus_old";
ALTER TABLE "MeetingNote" ALTER COLUMN "interactionStatus" SET DEFAULT 'PENDING';
COMMIT;
