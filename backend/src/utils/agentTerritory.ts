import { prisma } from '../prisma';

export function getTownKeywords(areaStr?: string | null): string[] {
  if (!areaStr) return [];
  const trimmed = areaStr.trim();
  if (!trimmed) return [];
  // Split on delimiters like comma, slash, ampersand, and the word 'and'
  const parts = trimmed.split(/&|,|\/|\band\b/i).map((s) => s.trim()).filter(Boolean);
  return Array.from(new Set([trimmed, ...parts]));
}

export function buildPropertyTerritoryFilter(assignedArea?: string | null) {
  const keywords = getTownKeywords(assignedArea);
  if (keywords.length === 0) return {};
  const orList = keywords.flatMap((kw) => [
    { city: { contains: kw, mode: 'insensitive' as const } },
    { area: { contains: kw, mode: 'insensitive' as const } },
    { neighborhood: { contains: kw, mode: 'insensitive' as const } },
    { addressDetails: { contains: kw, mode: 'insensitive' as const } },
    { title: { contains: kw, mode: 'insensitive' as const } },
  ]);
  return { OR: orList };
}

export function buildUserTerritoryFilter(assignedArea?: string | null) {
  const keywords = getTownKeywords(assignedArea);
  if (keywords.length === 0) return {};
  const orList = keywords.flatMap((kw) => [
    { city: { contains: kw, mode: 'insensitive' as const } },
    { address: { contains: kw, mode: 'insensitive' as const } },
    { region: { contains: kw, mode: 'insensitive' as const } },
    { assignedArea: { contains: kw, mode: 'insensitive' as const } },
  ]);
  return { OR: orList };
}

export function isTextInTerritory(targetText?: string | null, assignedArea?: string | null): boolean {
  if (!targetText || !assignedArea) return false;
  const keywords = getTownKeywords(assignedArea).map((k) => k.toLowerCase());
  const lower = targetText.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function isPropertyInTerritory(
  property: {
    city?: string | null;
    area?: string | null;
    neighborhood?: string | null;
    addressDetails?: string | null;
    title?: string | null;
  },
  assignedArea?: string | null
): boolean {
  if (!assignedArea) return false;
  const combined = [
    property.city,
    property.area,
    property.neighborhood,
    property.addressDetails,
    property.title,
  ].filter(Boolean).join(' ');
  return isTextInTerritory(combined, assignedArea);
}

export function isUserInTerritory(
  user: {
    city?: string | null;
    region?: string | null;
    address?: string | null;
    assignedArea?: string | null;
    properties?: any[];
  },
  assignedArea?: string | null
): boolean {
  if (!assignedArea) return false;
  const combinedUserText = [
    user.city,
    user.region,
    user.address,
    user.assignedArea,
  ].filter(Boolean).join(' ');

  if (isTextInTerritory(combinedUserText, assignedArea)) {
    return true;
  }

  // If user owns properties in the assigned territory
  if (Array.isArray(user.properties) && user.properties.length > 0) {
    return user.properties.some((p) => isPropertyInTerritory(p, assignedArea));
  }

  return false;
}

/**
 * Checks whether an agent is authorized to view or manage a specific property.
 * Admins are universally authorized.
 */
export async function verifyAgentPropertyAccess(
  userId: string,
  userRole: string,
  propertyId: string
): Promise<{
  authorized: boolean;
  property?: any;
  assignedArea?: string;
  error?: string;
}> {
  const normalizedRole = userRole.toLowerCase();

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!property) {
    return { authorized: false, error: 'Property not found' };
  }

  if (normalizedRole === 'admin') {
    return { authorized: true, property };
  }

  if (normalizedRole === 'agent') {
    const agent = await prisma.user.findUnique({
      where: { id: userId },
      select: { assignedArea: true, city: true, region: true },
    });

    const assignedArea = agent?.assignedArea || agent?.city || agent?.region || 'Addis Ababa';
    const hasAccess = isPropertyInTerritory(property, assignedArea);

    if (!hasAccess) {
      return {
        authorized: false,
        property,
        assignedArea,
        error: `Access Denied: You are only authorized to manage properties in your assigned territory (${assignedArea}). Property "${property.title}" is located in (${property.city}, ${property.area}).`,
      };
    }

    return { authorized: true, property, assignedArea };
  }

  // If owner of the property
  if (property.providerId === userId) {
    return { authorized: true, property };
  }

  return { authorized: false, error: 'Unauthorized' };
}

/**
 * Checks whether an agent is authorized to view or manage a specific user.
 * Admins are universally authorized.
 */
export async function verifyAgentUserAccess(
  agentUserId: string,
  agentRole: string,
  targetUserId: string
): Promise<{
  authorized: boolean;
  targetUser?: any;
  assignedArea?: string;
  error?: string;
}> {
  const normalizedRole = agentRole.toLowerCase();

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      properties: {
        select: {
          id: true,
          title: true,
          city: true,
          area: true,
          neighborhood: true,
        },
      },
    },
  });

  if (!targetUser) {
    return { authorized: false, error: 'User not found' };
  }

  if (normalizedRole === 'admin' || targetUserId === agentUserId) {
    return { authorized: true, targetUser };
  }

  if (normalizedRole === 'agent') {
    const agent = await prisma.user.findUnique({
      where: { id: agentUserId },
      select: { assignedArea: true, city: true, region: true },
    });

    const assignedArea = agent?.assignedArea || agent?.city || agent?.region || 'Addis Ababa';
    const hasAccess = isUserInTerritory(targetUser, assignedArea);

    if (!hasAccess) {
      return {
        authorized: false,
        targetUser,
        assignedArea,
        error: `Access Denied: You are only authorized to manage users in your assigned territory (${assignedArea}). User "${targetUser.name}" belongs to (${targetUser.city || 'unassigned'}).`,
      };
    }

    return { authorized: true, targetUser, assignedArea };
  }

  return { authorized: false, error: 'Unauthorized' };
}
