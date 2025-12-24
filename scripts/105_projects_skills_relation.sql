-- Add skill_ids array column to projects table for many-to-many relation with skills
ALTER TABLE projects ADD COLUMN IF NOT EXISTS skill_ids UUID[] DEFAULT '{}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_skill_ids ON projects USING GIN (skill_ids);

-- Comment for documentation
COMMENT ON COLUMN projects.skill_ids IS 'Array of skill UUIDs that represent the tech stack for this project';
