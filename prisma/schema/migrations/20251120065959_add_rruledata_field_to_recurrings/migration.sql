/*
  Warnings:

  - You are about to drop the column `endDatePeriod` on the `RecurringMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `RecurringMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `startDatePeriod` on the `RecurringMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `weekdays` on the `RecurringMeeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecurringMeeting" DROP COLUMN "endDatePeriod",
DROP COLUMN "frequency",
DROP COLUMN "startDatePeriod",
DROP COLUMN "weekdays",
ADD COLUMN     "rruleData" TEXT;

-- DropEnum
DROP TYPE "RecurrenceFrequency";
