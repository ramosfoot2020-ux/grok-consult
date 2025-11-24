-- Step 1: Add the "companyId" column, but allow it to be empty (NULL) for now.
ALTER TABLE "MeetingNote" ADD COLUMN "companyId" TEXT;

-- Step 2: Fill in the "companyId" for existing notes.
-- It takes the "mainCompanyId" from the "User" table by matching the note's "authorId".
UPDATE "MeetingNote"
SET "companyId" = "User"."mainCompanyId"
    FROM "User"
WHERE "MeetingNote"."authorId" = "User"."id";

-- Step 3: Now that all rows have a value, make the column required (NOT NULL).
ALTER TABLE "MeetingNote" ALTER COLUMN "companyId" SET NOT NULL;

-- Step 4: Add the foreign key constraint to link the tables officially.
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;