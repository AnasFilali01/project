/*
  # Update search history with access tracking

  1. Changes
    - Add new columns to search_history table
    - Add functions for managing access statistics and tags
    - Create index for tags search

  2. Security
    - All functions are SECURITY DEFINER with search_path set
    - Functions check user ownership via auth.uid()
*/

-- Add new columns to search_history
ALTER TABLE search_history 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS last_accessed timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_parameters jsonb DEFAULT '{}'::jsonb;

-- Create function to update access statistics
CREATE OR REPLACE FUNCTION update_search_history_access(p_history_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE search_history
  SET last_accessed = now(),
      view_count = view_count + 1
  WHERE id = p_history_id
    AND user_id = auth.uid();
END;
$$;

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