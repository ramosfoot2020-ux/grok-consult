BEGIN;

ALTER TYPE "MeetingTypes" RENAME TO "MeetingTypes_old";

CREATE TYPE "MeetingTypes" AS ENUM (
  'DAILY',
  'KICKOFF',
  'DEMO',
  'REQUIREMENTS_GATHERING'
);

ALTER TABLE "MeetingNote"
ALTER COLUMN "type" TYPE "MeetingTypes"
USING (
    CASE
        WHEN "type"::text = ANY(enum_range(NULL::"MeetingTypes")::text[])
        THEN "type"::text::"MeetingTypes"
        ELSE 'DAILY'::"MeetingTypes"
    END
);

DROP TYPE "MeetingTypes_old";

COMMIT;
