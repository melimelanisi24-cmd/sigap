export const STAFF_ROLES = ['admin', 'kepala_desa', 'super_admin'];

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}

export function getRoleHomePath(role) {
  if (isStaffRole(role)) return '/admin';
  return role === 'warga' ? '/dashboard' : '/login';
}
