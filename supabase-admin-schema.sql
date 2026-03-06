-- ============================================================
-- VivaGen AI - Admin Statistics Function
-- ============================================================
-- This function securely fetches aggregate data across the entire platform
-- while bypassing normal Row Level Security for the specified admin email.

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  total_users INT;
  active_users INT;
  total_interviews INT;
  result JSON;
BEGIN
  -- Security Check: Only allow execution if the caller's JWT email is the admin
  -- (Change 'habdullah4510@gmail.com' if your admin email is different)
  IF auth.jwt() ->> 'email' != 'habdullah4510@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: Only the admin can access platform statistics.';
  END IF;

  -- 1. Total Registered Users
  SELECT count(*) INTO total_users FROM auth.users;

  -- 2. Active Users (Users who have generated an interview THIS month)
  SELECT count(DISTINCT user_id) INTO active_users 
  FROM public.usage_tracking 
  WHERE month = to_char(CURRENT_DATE, 'YYYY-MM');

  -- 3. Total Interviews generated across the platform
  SELECT count(*) INTO total_interviews FROM public.interviews;

  -- Build the JSON response
  result := json_build_object(
    'total_users', total_users,
    'active_users', active_users,
    'total_interviews', total_interviews
  );

  RETURN result;
END;
$$;
