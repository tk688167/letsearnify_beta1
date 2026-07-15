import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

webpush.setVapidDetails(
  'mailto:Letsearnify@gmail.com',
  vapidPublicKey,
  vapidPrivateKey
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
    notificationId?: string;
  }
) {
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/admin/notifications',
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-72x72.png',
        notificationId: payload.notificationId || 'notification',
        tag: payload.notificationId || 'notification',
      })
    );

    return { success: true, result };
  } catch (error: any) {
    console.error('Push notification error:', error);
    
    // If subscription expired, remove it
    if (error.statusCode === 410) {
      return { success: false, expired: true, error: error.message };
    }
    
    return { success: false, error: error.message };
  }
}

export function getVapidPublicKey() {
  return vapidPublicKey;
}