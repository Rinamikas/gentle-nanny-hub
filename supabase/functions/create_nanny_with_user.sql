CREATE OR REPLACE FUNCTION public.create_nanny_with_user(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_birth_date date,
  p_position text,
  p_age_group text,
  p_camera_phone text,
  p_camera_number text,
  p_address text,
  p_relative_phone text,
  p_experience_years integer,
  p_education text,
  p_hourly_rate numeric,
  p_photo_url text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_nanny_id UUID;
BEGIN
  -- Проверяем существование профиля по email
  SELECT id INTO v_user_id 
  FROM profiles 
  WHERE email = p_email;

  -- Если профиль не найден, создаем новый
  IF v_user_id IS NULL THEN
    -- Генерируем UUID для нового пользователя
    v_user_id := gen_random_uuid();
    
    -- Создаем запись в profiles
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      phone,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      p_email,
      p_first_name,
      p_last_name,
      p_phone,
      now(),
      now()
    );
  END IF;

  -- Создаем роль няни
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'nanny')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Создаем профиль няни
  INSERT INTO nanny_profiles (
    user_id,
    birth_date,
    position,
    age_group,
    camera_phone,
    camera_number,
    address,
    relative_phone,
    experience_years,
    education,
    hourly_rate,
    photo_url
  )
  VALUES (
    v_user_id,
    p_birth_date,
    p_position,
    p_age_group,
    p_camera_phone,
    p_camera_number,
    p_address,
    p_relative_phone,
    p_experience_years,
    p_education,
    p_hourly_rate,
    p_photo_url
  )
  RETURNING id INTO v_nanny_id;

  RETURN v_nanny_id;
END;
$$;