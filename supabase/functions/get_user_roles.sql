CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS TABLE (
  user_id UUID,
  role text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.user_id::UUID, ur.role::text
  FROM user_roles ur;
END;
$$;