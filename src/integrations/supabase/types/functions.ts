export interface Functions {
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
}