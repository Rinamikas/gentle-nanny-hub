CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_profile_exists boolean;
BEGIN
  -- Проверяем существование профиля
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = NEW.id
  ) INTO v_profile_exists;

  -- Создаем базовый профиль если его нет
  IF NOT v_profile_exists THEN
    INSERT INTO public.profiles (
      id,
      first_name,
      last_name,
      main_phone
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'phone'
    );
  END IF;

  -- Проверяем существование роли
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = NEW.id
  ) THEN
    -- Проверяем роль пользователя
    IF NEW.raw_user_meta_data->>'role' = 'nanny' THEN
      -- Создаем роль няни
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'nanny');
    ELSE
      -- По умолчанию создаем роль родителя
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'parent');
      
      -- Создаем профиль родителя если его еще нет
      IF NOT EXISTS (
        SELECT 1 FROM parent_profiles WHERE user_id = NEW.id
      ) THEN
        INSERT INTO public.parent_profiles (user_id)
        VALUES (NEW.id);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RAISE;
END;
$$;