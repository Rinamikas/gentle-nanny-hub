CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Создаем базовый профиль
  INSERT INTO public.profiles (id, first_name, last_name, main_phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Проверяем роль пользователя
  IF NEW.raw_user_meta_data->>'role' = 'nanny' THEN
    -- Создаем роль няни
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'nanny');
  ELSE
    -- По умолчанию создаем роль родителя
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'parent');
    
    -- Создаем профиль родителя
    INSERT INTO public.parent_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;