export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()

  if (m.includes('invalid login') || m.includes('invalid_credentials') || m.includes('invalid email or password'))
    return 'Incorrect email or password.'

  if (m.includes('email already') || m.includes('user_already_exists') || m.includes('already registered'))
    return 'An account with this email already exists. Try logging in.'

  if (m.includes('weak_password') || m.includes('password should be'))
    return 'Password must be at least 8 characters.'

  if (m.includes('email_not_confirmed') || m.includes('not confirmed'))
    return 'Please check your email and click the confirmation link first.'

  if (m.includes('rate limit') || m.includes('over_email_send_rate_limit') || m.includes('too many'))
    return 'Too many attempts. Please wait a few minutes and try again.'

  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch'))
    return 'Connection error. Check your internet and try again.'

  if (m.includes('user not found'))
    return 'No account found with that email.'

  // Fall back to a clean version of the original message
  return message.charAt(0).toUpperCase() + message.slice(1).replace(/_/g, ' ')
}
