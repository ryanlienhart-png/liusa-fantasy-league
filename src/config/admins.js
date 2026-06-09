const adminEmails = (import.meta.env.VITE_GLOBAL_ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

// Srina is the global super admin (commissioner).
const SUPER_ADMIN_NAMES = ['srina']

export function resolveUserRole({ email, name }) {
  const normalizedEmail = email?.toLowerCase() ?? ''
  const normalizedName = name?.trim().toLowerCase() ?? ''

  if (adminEmails.includes(normalizedEmail)) return 'global_admin'
  if (SUPER_ADMIN_NAMES.includes(normalizedName)) return 'global_admin'
  return 'user'
}
