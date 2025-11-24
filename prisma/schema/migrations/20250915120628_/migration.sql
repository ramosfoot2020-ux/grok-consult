/*
  Warnings:

  - Made the column `additionalBlocks` on table `MeetingNote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MeetingNote" ALTER COLUMN "additionalBlocks" SET NOT NULL;
