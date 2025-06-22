
import { prisma } from './db';

export type Permission = 
  | 'read:dashboard'
  | 'write:dashboard'
  | 'read:admin'
  | 'write:admin'
  | 'read:users'
  | 'write:users'
  | 'read:projects'
  | 'write:projects'
  | 'read:chat'
  | 'write:chat'
  | 'read:ai'
  | 'write:ai'
  | 'manage:system';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

// Get user roles (Mock implementation for development)
export async function getUserRoles(userId: string): Promise<Role[]> {
  return [
    {
      id: 'mock-admin-role',
      name: 'admin',
      description: 'Full system administrator',
      permissions: ['manage:system'] as Permission[],
    }
  ];
}

// Check if user has permission (Mock implementation for development)
export async function userHasPermission(userId: string, permission: Permission): Promise<boolean> {
  return true;
}

// Check if user has role
export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.some(role => role.name === roleName);
}

// Default roles and permissions
export const DEFAULT_ROLES = {
  admin: {
    name: 'admin',
    description: 'Full system administrator',
    permissions: ['manage:system'] as Permission[],
  },
  manager: {
    name: 'manager',
    description: 'Team manager with extended permissions',
    permissions: [
      'read:dashboard', 'write:dashboard',
      'read:users', 'write:users',
      'read:projects', 'write:projects',
      'read:chat', 'write:chat',
      'read:ai', 'write:ai'
    ] as Permission[],
  },
  user: {
    name: 'user',
    description: 'Standard user',
    permissions: [
      'read:dashboard', 'write:dashboard',
      'read:projects', 'write:projects',
      'read:chat', 'write:chat',
      'read:ai'
    ] as Permission[],
  },
  viewer: {
    name: 'viewer',
    description: 'Read-only access',
    permissions: [
      'read:dashboard',
      'read:projects',
      'read:chat'
    ] as Permission[],
  },
};

// Assign role to user
export async function assignRole(userId: string, roleName: string, assignedBy?: string): Promise<void> {
  // Find the role
  const role = await prisma.userRole.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  // Assign the role
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {
      assignedBy,
    },
    create: {
      userId,
      roleId: role.id,
      assignedBy,
    },
  });
}

// Initialize default roles
export async function initializeDefaultRoles(): Promise<void> {
  for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
    await prisma.userRole.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        permissions: roleData.permissions,
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
      },
    });
  }
}
