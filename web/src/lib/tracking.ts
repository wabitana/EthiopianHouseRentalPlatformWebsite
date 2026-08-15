import { prisma } from "./prisma";
import { notifyOrderUpdate, notifyBookingUpdate } from "./notifications";

const ORDER_FLOW = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const SERVICE_FLOW = ["PENDING", "SCHEDULED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];

export function getOrderTimeline(currentStatus: string) {
  const idx = ORDER_FLOW.indexOf(currentStatus);
  return ORDER_FLOW.map((status, i) => ({
    status,
    label: status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
    completed: idx >= 0 && i <= idx,
    current: status === currentStatus,
  }));
}

export function getServiceTimeline(currentStatus: string) {
  const idx = SERVICE_FLOW.indexOf(currentStatus);
  return SERVICE_FLOW.map((status, i) => ({
    status,
    label: status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
    completed: idx >= 0 && i <= idx,
    current: status === currentStatus,
  }));
}

export async function addOrderTracking(
  orderId: string,
  status: string,
  message: string
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  await prisma.trackingEvent.create({
    data: { orderId, status, message },
  });

  await notifyOrderUpdate(order.userId, order.orderNumber, status, orderId);
  return order;
}

export async function addBookingTracking(
  bookingId: string,
  status: string,
  message: string
) {
  const booking = await prisma.serviceBooking.update({
    where: { id: bookingId },
    data: { status },
  });

  await prisma.trackingEvent.create({
    data: { serviceBookingId: bookingId, status, message },
  });

  await notifyBookingUpdate(
    booking.userId,
    booking.bookingNumber,
    status,
    bookingId
  );
  return booking;
}

export async function seedInitialTracking(
  orderId: string,
  status: string,
  message: string
) {
  return prisma.trackingEvent.create({
    data: { orderId, status, message },
  });
}

export async function seedInitialBookingTracking(
  bookingId: string,
  status: string,
  message: string
) {
  return prisma.trackingEvent.create({
    data: { serviceBookingId: bookingId, status, message },
  });
}
