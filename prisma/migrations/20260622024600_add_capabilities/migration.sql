-- Create Capability enum
DO $$ BEGIN
  CREATE TYPE "Capability" AS ENUM ('COMMERCE', 'MARKETPLACE', 'CRM', 'FINANCE', 'CONTENT', 'ANALYTICS', 'AI');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add capabilities column to Project table
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "capabilities" "Capability"[] DEFAULT '{}';

-- Create migration tracking record
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
VALUES (
  '20260622024600_add_capabilities',
  md5('create type Capability and add capabilities column to Project'),
  NOW(),
  '20260622024600_add_capabilities',
  NULL,
  NULL,
  NOW(),
  1
) ON CONFLICT (id) DO NOTHING;
