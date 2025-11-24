-- Step 1: Add the column, but allow it to be empty (NULL).
ALTER TABLE "User" ADD COLUMN "mainCompanyId" TEXT;

-- Step 2: This is a special PostgreSQL block to create companies and link them.
-- It finds all users who need a main company and creates one for each.
DO $$
DECLARE
user_record RECORD;
    new_company_id TEXT;
BEGIN
FOR user_record IN
SELECT id, "firstName" FROM "User" WHERE "mainCompanyId" IS NULL
    LOOP
-- Create a new company for the user
INSERT INTO "Company" (id, name, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), user_record."firstName" || '''s Space', NOW(), NOW())
    RETURNING id INTO new_company_id;

-- Update the user with their new main company's ID
UPDATE "User"
SET "mainCompanyId" = new_company_id
WHERE id = user_record.id;

-- Also create the link in the UserCompany table
INSERT INTO "UserCompany" (id, "userId", "companyId", role, "createdAt", "updatedAt", nickname)
VALUES (gen_random_uuid(), user_record.id, new_company_id, 'OWNER', NOW(), NOW(), '');
END LOOP;
END $$;


-- Step 3: Now that all rows have a value, make the column required (NOT NULL).
ALTER TABLE "User" ALTER COLUMN "mainCompanyId" SET NOT NULL;

-- Step 4: Add the unique constraint and foreign key.
CREATE UNIQUE INDEX "User_mainCompanyId_key" ON "User"("mainCompanyId");
ALTER TABLE "User" ADD CONSTRAINT "User_mainCompanyId_fkey" FOREIGN KEY ("mainCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;