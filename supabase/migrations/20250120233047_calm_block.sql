/*
  # Add search history functionality

  1. New Tables
    - `search_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `query` (text)
      - `mode` (text, either 'direct' or 'file')
      - `timestamp` (timestamptz)
      - `is_favorite` (boolean)
      - `results_count` (integer)
      - `file_name` (text, optional)

  2. Security
    - Enable RLS on `search_history` table
    - Add policies for authenticated users to:
      - Read their own search history
      - Create new search history entries
      - Update their own search history entries
      - Delete their own search history entries
*/

-- Create search history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  query text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('direct', 'file')),
  timestamp timestamptz DEFAULT now(),
  is_favorite boolean DEFAULT false,
  results_count integer DEFAULT 0,
  file_name text
);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own search history"
  ON search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own search history"
  ON search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search history"
  ON search_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search history"
  ON search_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX search_history_user_id_timestamp_idx ON search_history (user_id, timestamp DESC);

-- Create function to clean up old search history
CREATE OR REPLACE FUNCTION cleanup_search_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete non-favorite entries older than 30 days
  DELETE FROM search_history
  WHERE is_favorite = false
    AND timestamp < now() - interval '30 days';
END;
$$;