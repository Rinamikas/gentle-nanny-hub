export interface Functions {
  check_verification_code: {
    Args: {
      p_email: string
      p_code: string
    }
    Returns: boolean
  }
  check_verification_code_access: {
    Args: {
      p_email: string
    }
    Returns: boolean
  }
  current_user_email: {
    Args: Record<PropertyKey, never>
    Returns: string
  }
  get_user_roles: {
    Args: Record<PropertyKey, never>
    Returns: {
      user_id: string
      role: string
    }[]
  }
}