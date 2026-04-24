/**
 * Pure redirect logic — extracted for testability without Next.js.
 * @param pathname  The request pathname
 * @param userId    Supabase user ID of the logged-in user, or null
 */
export function shouldRedirectToLogin(pathname: string, userId: string | null): boolean {
  if (!pathname.startsWith('/admin')) return false
  return userId === null
}
