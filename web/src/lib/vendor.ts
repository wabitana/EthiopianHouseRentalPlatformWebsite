import { prisma } from "./prisma";

export async function getVendorForUser(userId: string) {
  return prisma.vendor.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
}

export async function requireApprovedVendor(userId: string) {
  const vendor = await getVendorForUser(userId);
  if (!vendor) throw new Error("Vendor not found");
  if (vendor.status !== "APPROVED") throw new Error("Vendor not approved");
  return vendor;
}
