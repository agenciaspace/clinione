-- Update schedule blocks table to include additional block types
-- This migration adds new block types to the existing constraint

-- Drop the existing constraint
ALTER TABLE public.schedule_blocks DROP CONSTRAINT IF EXISTS schedule_blocks_block_type_check;

-- Add the new constraint with additional block types
ALTER TABLE public.schedule_blocks 
ADD CONSTRAINT schedule_blocks_block_type_check 
CHECK (block_type IN (
  'unavailable', 
  'break', 
  'lunch',
  'meeting', 
  'conference', 
  'training',
  'vacation', 
  'sick_leave', 
  'personal', 
  'emergency', 
  'travel', 
  'maintenance'
));

-- Update the comment to reflect the new types
COMMENT ON COLUMN public.schedule_blocks.block_type IS 'Type of block: unavailable, break, lunch, meeting, conference, training, vacation, sick_leave, personal, emergency, travel, maintenance';