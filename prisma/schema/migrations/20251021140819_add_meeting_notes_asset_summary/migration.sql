-- AlterTable
ALTER TABLE "MeetingNote" ADD COLUMN     "globalSummaryJson" JSONB;

-- CreateTable
CREATE TABLE "AssetSummary" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "templateUsed" TEXT NOT NULL,
    "tokenUsage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetSummary_assetId_key" ON "AssetSummary"("assetId");

-- AddForeignKey
ALTER TABLE "AssetSummary" ADD CONSTRAINT "AssetSummary_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MeetingAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
