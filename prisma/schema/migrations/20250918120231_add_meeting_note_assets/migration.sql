-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('PENDING_UPLOAD', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "MeetingAssetsOnMeetingNotes" (
    "meetingNoteId" TEXT NOT NULL,
    "meetingAssetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingAssetsOnMeetingNotes_pkey" PRIMARY KEY ("meetingNoteId","meetingAssetId")
);

-- CreateTable
CREATE TABLE "MeetingAsset" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "transcription" TEXT,
    "structuredTranscription" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAsset_storageKey_key" ON "MeetingAsset"("storageKey");

-- AddForeignKey
ALTER TABLE "MeetingAssetsOnMeetingNotes" ADD CONSTRAINT "MeetingAssetsOnMeetingNotes_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAssetsOnMeetingNotes" ADD CONSTRAINT "MeetingAssetsOnMeetingNotes_meetingAssetId_fkey" FOREIGN KEY ("meetingAssetId") REFERENCES "MeetingAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
