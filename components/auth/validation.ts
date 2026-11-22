const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 8

export function requiredField(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`
}

export function validateEmail(value: string): string | null {
  const missing = requiredField(value, "Email")
  if (missing) return missing

  return EMAIL_PATTERN.test(value.trim())
    ? null
    : "Enter a valid email address."
}

export function validatePassword(value: string): string | null {
  const missing = requiredField(value, "Password")
  if (missing) return missing

  return value.length >= MIN_PASSWORD_LENGTH
    ? null
    : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
}
