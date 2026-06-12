const adminEmails = (import.meta.env.VITE_GLOBAL_ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export function resolveUserRole({ email }) {
  if (adminEmails.includes(email?.toLowerCase() ?? '')) return 'global_admin'
  return 'user'
}
