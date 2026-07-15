self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'New notification from LetsEarnify',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/admin/notifications',
      notificationId: data.notificationId
    },
    actions: [
      {
        action: 'view',
        title: '🔔 View',
      },
      {
        action: 'dismiss',
        title: '✖️ Dismiss',
      }
    ],
    tag: data.tag || 'notification',
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'LetsEarnify Admin Alert', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/admin/notifications';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});