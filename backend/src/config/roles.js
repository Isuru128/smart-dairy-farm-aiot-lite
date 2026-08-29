const ROLES = {
  SUPER_ADMIN: 'super-admin',
  FARM_MANAGER: 'farm-manager',
  VETERINARIAN: 'veterinarian',
  EMPLOYEE: 'employee',
  FINANCIAL_OFFICER: 'financial-officer',
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.FARM_MANAGER]: ['livestock:*', 'milk:*', 'sensors:*', 'feeding:*', 'inventory:*', 'operations:*', 'finance:read', 'alerts:*', 'ai:*'],
  [ROLES.VETERINARIAN]: ['livestock:*', 'health:*', 'vaccination:*', 'alerts:read'],
  [ROLES.EMPLOYEE]: ['livestock:read', 'milk:write', 'feeding:read', 'operations:read'],
  [ROLES.FINANCIAL_OFFICER]: ['finance:*', 'inventory:read', 'milk:read'],
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
};
