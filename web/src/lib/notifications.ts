import { prisma } from "./prisma";

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "SYSTEM",
      link: params.link,
    },
  });
}

export async function notifyOrderUpdate(
  userId: string,
  orderNumber: string,
  status: string,
  orderId: string
) {
  const messages: Record<string, string> = {
    CONFIRMED: "Your payment was confirmed. We're preparing your order.",
    PROCESSING: "Your order is being processed.",
    SHIPPED: "Your order is on the way!",
    DELIVERED: "Your order has been delivered. Thank you!",
    CANCELLED: "Your order was cancelled.",
  };

  return createNotification({
    userId,
    title: `Order ${orderNumber}`,
    message: messages[status] || `Order status updated to ${status}`,
    type: "ORDER",
    link: `/orders/${orderId}`,
  });
}

export async function notifyBookingUpdate(
  userId: string,
  bookingNumber: string,
  status: string,
  bookingId: string
) {
  const messages: Record<string, string> = {
    SCHEDULED: "Your service has been scheduled.",
    ASSIGNED: "A service provider has been assigned.",
    IN_PROGRESS: "Your service is in progress.",
    COMPLETED: "Your service has been completed.",
    CANCELLED: "Your booking was cancelled.",
  };

  return createNotification({
    userId,
    title: `Booking ${bookingNumber}`,
    message: messages[status] || `Booking status updated to ${status}`,
    type: "SERVICE",
    link: `/bookings/${bookingId}`,
  });
}
