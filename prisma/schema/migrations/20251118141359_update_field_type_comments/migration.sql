/*
  Warnings:

  - Added the required column `type` to the `MeetingComment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeMeetingPage" AS ENUM ('after', 'before');

-- AlterTable
ALTER TABLE "MeetingComment" DROP COLUMN "type",
ADD COLUMN     "type" "TypeMeetingPage" NOT NULL;
