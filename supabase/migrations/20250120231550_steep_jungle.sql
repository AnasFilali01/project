/*
  # Create delete_user function

  This function allows users to delete their account and associated data.
*/

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's tokens
  DELETE FROM user_tokens WHERE user_id = auth.uid();
  
  -- Delete user's account
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;