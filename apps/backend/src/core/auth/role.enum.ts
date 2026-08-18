/** Likya Super-App rol modeli (JWT payload + RolesGuard ortak). */
export enum Role {
  TOURIST = 'tourist',
  MERCHANT = 'merchant',
  GUIDE = 'guide',
  ADMIN = 'admin',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.TOURIST]: 'Turist',
  [Role.MERCHANT]: 'Yerel Esnaf',
  [Role.GUIDE]: 'Rehber',
  [Role.ADMIN]: 'Sistem Yöneticisi',
};
