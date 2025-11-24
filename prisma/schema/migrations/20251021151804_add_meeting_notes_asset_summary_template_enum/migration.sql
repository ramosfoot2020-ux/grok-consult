/*
  Warnings:

  - Changed the type of `templateUsed` on the `AssetSummary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AssetSummary" DROP COLUMN "templateUsed",
ADD COLUMN     "templateUsed" "MeetingTypes" NOT NULL;
