import { prisma } from './prisma';

export interface SendNotificationInput {
  userId: string;
  title: string;
  message: string;
}

/**
 * Unified Notification Dispatcher
 * Saves notification to internal database and provides placeholder for FCM Push Messaging
 */
export async function sendNotification({ userId, title, message }: SendNotificationInput) {
  try {
    // 1. Internal DB Notification
    const notif = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        isRead: false,
      },
    });

    // 2. Future FCM Push Notification Placeholder
    // await sendFcmPushNotification(userId, title, message);

    return notif;
  } catch (error) {
    console.error('Failed to dispatch notification:', error);
    return null;
  }
}
