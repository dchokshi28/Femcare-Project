export const getAuthErrorMessage = (error, action) => {
  const message = (error?.message || '').toLowerCase();
  const code = (error?.code || '').toLowerCase();

  if (error?.name === 'AuthRetryableFetchError' || message.includes('failed to fetch')) {
    return 'Cannot reach the configured Supabase project. Check your network connection and try again.';
  }
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (error?.status === 429 || code === 'over_email_send_rate_limit' || message.includes('email rate limit')) {
    return action === 'signup'
      ? 'Too many signup attempts. Please wait and try again later.'
      : 'Too many attempts. Please wait and try again later.';
  }
  if (code === 'email_address_invalid' || /email address .* is invalid|invalid email/.test(message)) {
    return 'Please enter a valid email address.';
  }
  if (code === 'user_already_exists' || message.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in.';
  }

  return 'We could not complete that request. Please try again later.';
};
