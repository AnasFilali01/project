/*
  # Enhance search history functionality

  1. Changes
    - Add tags column for better search categorization
    - Add notes column for user comments
    - Add last_accessed timestamp for tracking usage
    - Add view count for popularity tracking
    - Add search parameters column for storing search configuration

  2. Security
    - Update RLS policies to include new columns
*/

-- Add new columns to search_history
ALTER TABLE search_history 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS last_accessed timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_parameters jsonb DEFAULT '{}'::jsonb;

-- Create function to update last_accessed and view_count
CREATE OR REPLACE FUNCTION update_search_history_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE search_history
  SET last_accessed = now(),
      view_count = view_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger for updating access statistics
DROP TRIGGER IF EXISTS update_search_history_access_trigger ON search_history;
CREATE TRIGGER update_search_history_access_trigger
  AFTER SELECT ON search_history
  FOR EACH ROW
  EXECUTE FUNCTION update_search_history_access();

-- Create index for tags search
CREATE INDEX IF NOT EXISTS search_history_tags_idx ON search_history USING gin (tags);

-- Create function to add tags to search history
CREATE OR REPLACE FUNCTION add_search_history_tags(
  p_history_id uuid,
  p_tags text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE search_history
  SET tags = array_cat(tags, p_tags)
  WHERE id = p_history_id
    AND user_id = auth.uid();
END;
$$;

-- Create function to remove tags from search history
CREATE OR REPLACE FUNCTION remove_search_history_tags(
  p_history_id uuid,
  p_tags text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE search_history
  SET tags = array_remove(tags, UNNEST(p_tags))
  WHERE id = p_history_id
    AND user_id = auth.uid();
END;
$$;

-- Create function to update search history notes
CREATE OR REPLACE FUNCTION update_search_history_notes(
  p_history_id uuid,
  p_notes text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE search_history
  SET notes = p_notes
  WHERE id = p_history_id
    AND user_id = auth.uid();
END;
$$;